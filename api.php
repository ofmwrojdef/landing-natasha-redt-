<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Archivos de datos
$visitorsFile = 'data/visitors.json';
$blockedCountriesFile = 'data/blocked_countries.json';
$dataDir = 'data';

// Crear directorio de datos si no existe
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Función para leer datos de visitantes
function getVisitors() {
    global $visitorsFile;
    if (file_exists($visitorsFile)) {
        $data = file_get_contents($visitorsFile);
        return json_decode($data, true) ?: [];
    }
    return [];
}

// Función para guardar datos de visitantes
function saveVisitors($visitors) {
    global $visitorsFile;
    // Mantener solo los últimos 5000 registros
    if (count($visitors) > 5000) {
        $visitors = array_slice($visitors, -5000);
    }
    return file_put_contents($visitorsFile, json_encode($visitors, JSON_PRETTY_PRINT));
}

// Función para leer países bloqueados
function getBlockedCountries() {
    global $blockedCountriesFile;
    if (file_exists($blockedCountriesFile)) {
        $data = file_get_contents($blockedCountriesFile);
        return json_decode($data, true) ?: [];
    }
    return [];
}

// Función para guardar países bloqueados
function saveBlockedCountries($countries) {
    global $blockedCountriesFile;
    return file_put_contents($blockedCountriesFile, json_encode($countries, JSON_PRETTY_PRINT));
}

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'visitors') {
                // Obtener todos los visitantes
                $visitors = getVisitors();
                echo json_encode(['success' => true, 'data' => $visitors]);
                
            } elseif ($action === 'stats') {
                // Obtener estadísticas calculadas
                $visitors = getVisitors();
                
                $totalClicks = count($visitors);
                $uniqueIPs = count(array_unique(array_column($visitors, 'ip')));
                $countries = array_unique(array_filter(array_column($visitors, 'country')));
                $activeCountries = count($countries);
                
                // Calcular visitantes de hoy
                $today = date('Y-m-d');
                $todayVisitors = array_filter($visitors, function($v) use ($today) {
                    return strpos($v['timestamp'], $today) === 0;
                });
                $todayClicks = count($todayVisitors);
                
                // Calcular últimos 7 días
                $last7Days = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date = date('Y-m-d', strtotime("-$i days"));
                    $dayVisitors = array_filter($visitors, function($v) use ($date) {
                        return strpos($v['timestamp'], $date) === 0;
                    });
                    $last7Days[$date] = count($dayVisitors);
                }
                
                // Top países
                $countryCounts = [];
                foreach ($visitors as $visitor) {
                    $country = $visitor['country'] ?: 'Sin ubicación';
                    $countryCounts[$country] = ($countryCounts[$country] ?? 0) + 1;
                }
                arsort($countryCounts);
                $topCountries = array_slice($countryCounts, 0, 5, true);
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'totalClicks' => $totalClicks,
                        'uniqueVisitors' => $uniqueIPs,
                        'activeCountries' => $activeCountries,
                        'todayClicks' => $todayClicks,
                        'clicksByDay' => $last7Days,
                        'topCountries' => $topCountries,
                        'allVisitors' => $visitors
                    ]
                ]);
                
            } elseif ($action === 'blocked') {
                // Obtener países bloqueados
                $blocked = getBlockedCountries();
                echo json_encode(['success' => true, 'data' => $blocked]);
                
            } else {
                throw new Exception('Acción no válida');
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if ($action === 'visitor') {
                // Agregar nuevo visitante
                $visitors = getVisitors();
                
                $newVisitor = [
                    'id' => uniqid(),
                    'timestamp' => date('c'),
                    'ip' => $input['ip'] ?? 'unknown',
                    'country' => $input['country'] ?? 'Sin ubicación',
                    'countryCode' => $input['countryCode'] ?? 'XX',
                    'region' => $input['region'] ?? 'unknown',
                    'city' => $input['city'] ?? 'unknown',
                    'latitude' => $input['latitude'] ?? null,
                    'longitude' => $input['longitude'] ?? null,
                    'timezone' => $input['timezone'] ?? null,
                    'userAgent' => $input['userAgent'] ?? '',
                    'language' => $input['language'] ?? '',
                    'referrer' => $input['referrer'] ?? '',
                    'url' => $input['url'] ?? ''
                ];
                
                $visitors[] = $newVisitor;
                
                if (saveVisitors($visitors)) {
                    echo json_encode(['success' => true, 'message' => 'Visitante guardado']);
                } else {
                    throw new Exception('Error guardando visitante');
                }
                
            } elseif ($action === 'blocked') {
                // Actualizar países bloqueados
                $countries = $input['countries'] ?? [];
                
                if (saveBlockedCountries($countries)) {
                    echo json_encode(['success' => true, 'message' => 'Países bloqueados actualizados']);
                } else {
                    throw new Exception('Error actualizando países bloqueados');
                }
                
            } else {
                throw new Exception('Acción no válida');
            }
            break;
            
        case 'DELETE':
            if ($action === 'cleanup') {
                // Limpiar datos antiguos (más de 30 días)
                $visitors = getVisitors();
                $cutoffDate = date('Y-m-d', strtotime('-30 days'));
                
                $filteredVisitors = array_filter($visitors, function($v) use ($cutoffDate) {
                    return strpos($v['timestamp'], $cutoffDate) > 0 || $v['timestamp'] > $cutoffDate;
                });
                
                $removed = count($visitors) - count($filteredVisitors);
                
                if (saveVisitors($filteredVisitors)) {
                    echo json_encode(['success' => true, 'message' => "Eliminados $removed registros antiguos"]);
                } else {
                    throw new Exception('Error limpiando datos');
                }
                
            } else {
                throw new Exception('Acción no válida');
            }
            break;
            
        default:
            throw new Exception('Método no permitido');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
