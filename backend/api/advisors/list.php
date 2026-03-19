<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$faculty_id = isset($_GET['faculty_id']) ? intval($_GET['faculty_id']) : 0;
$program_id = isset($_GET['program_id']) ? intval($_GET['program_id']) : 0;
$expertise_id = isset($_GET['expertise_id']) ? intval($_GET['expertise_id']) : 0;
$available_only = isset($_GET['available_only']) ? intval($_GET['available_only']) : 0;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 20;
$offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

$where = [];
if ($q !== '') { $qLike = '%'.$conn->real_escape_string($q).'%'; $where[] = "(a.first_name LIKE '$qLike' OR a.last_name LIKE '$qLike')"; }
if ($faculty_id>0) { $where[] = 'a.faculty_id='.$faculty_id; }
if ($program_id>0) { $where[] = 'a.program_id='.$program_id; }
if ($expertise_id>0) { $where[] = 'EXISTS (SELECT 1 FROM advisor_expertise ae WHERE ae.advisor_id=a.advisor_id AND ae.expertise_id='.$expertise_id.')'; }
if ($available_only===1) { $where[] = '(SELECT COUNT(*) FROM request r WHERE r.advisor_id=a.advisor_id AND r.status="อนุมัติ") < a.project_capacity'; }
$whereSql = empty($where) ? '' : (' WHERE '.implode(' AND ', $where));

// Count total for pagination
$countSql = "SELECT COUNT(*) as total FROM advisor a".$whereSql;
$countRes = $conn->query($countSql);
$total = $countRes ? $countRes->fetch_assoc()['total'] : 0;

$sql = "SELECT a.advisor_id, a.prefix, a.first_name, a.last_name, a.image, a.project_capacity,
        COALESCE((SELECT COUNT(*) FROM request r WHERE r.advisor_id=a.advisor_id AND r.status='อนุมัติ'),0) AS current_students,
        ar.rank_name_th AS academic_rank_name, ad.degree_name_th AS academic_degree_name,
        f.faculty_name, d.department_name, p.program_name
        FROM advisor a
        LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
        LEFT JOIN academic_degree ad ON a.academic_degree_id = ad.academic_degree_id
        LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
        LEFT JOIN department d ON a.department_id = d.department_id
        LEFT JOIN program p ON a.program_id = p.program_id
        ".$whereSql." ORDER BY a.advisor_id LIMIT $limit OFFSET $offset";

$res = $conn->query($sql);
$rows = [];
if ($res) { 
    while ($r = $res->fetch_assoc()) { 
        $r['available_capacity'] = intval($r['project_capacity']) - intval($r['current_students']); 
        $r['capacity'] = intval($r['project_capacity']);
        
        // Get expertises for this advisor
        $expStmt = $conn->prepare("SELECT e.expertise_id, e.expertise_name AS expertise_name_th 
                                   FROM advisor_expertise ae 
                                   JOIN expertise e ON ae.expertise_id = e.expertise_id 
                                   WHERE ae.advisor_id = ?");
        $expStmt->bind_param('i', $r['advisor_id']);
        $expStmt->execute();
        $expRes = $expStmt->get_result();
        $expertises = [];
        while ($exp = $expRes->fetch_assoc()) {
            $expertises[] = $exp;
        }
        $r['expertises'] = $expertises;
        
        $rows[] = $r; 
    } 
}

$totalPages = ceil($total / $limit);
$currentPage = floor($offset / $limit) + 1;

echo json_encode([
    'success' => true,
    'data' => $rows,
    'pagination' => [
        'total' => intval($total),
        'total_pages' => intval($totalPages),
        'current_page' => intval($currentPage),
        'per_page' => intval($limit)
    ]
]);
?>

