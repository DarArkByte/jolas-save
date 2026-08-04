<?php
define("DB_HOST", "localhost");
define("DB_NAME", "jolascom_jolassave");
define("DB_USER", "jolascom_jolasuser");
define("DB_PASS", "JolasDB@Secure2026!");

$pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$pdo->exec("UPDATE DepositRequest SET goalName='Car' WHERE goalName='Goal'");
$pdo->exec("UPDATE Transaction SET goalName='Car' WHERE goalName='Goal'");
echo json_encode(["status"=>"updated"]);