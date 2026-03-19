<?php
// CLI/cron script to mark pending requests as expired
// Usage (Windows Task Scheduler / cron): php -f backend/jobs/expire_requests.php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../connect.php';

$sql = "UPDATE request SET status='หมดอายุ' WHERE status='รอดำเนินการ' AND expire_date IS NOT NULL AND expire_date < CURRENT_DATE";
$res = $conn->query($sql);
$affected = $conn->affected_rows;
echo "Expired requests updated: $affected\n";
?>

