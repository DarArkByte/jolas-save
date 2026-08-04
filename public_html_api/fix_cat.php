<?php
header("Content-Type: application/json; charset=utf-8");
define("DB_HOST", "localhost");
define("DB_NAME", "jolascom_jolassave");
define("DB_USER", "jolascom_jolasuser");
define("DB_PASS", "JolasDB@Secure2026!");

$pdo = new PDO(
    "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"]
);

// Convert table column to utf8mb4 explicitly
$pdo->exec("ALTER TABLE SavingsCategory CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

// Clean replace icons
$categories = [
    ["cat-rent", "House Rent", "🏠", "from-amber-400 to-orange-500"],
    ["cat-school", "School Fees", "🎓", "from-blue-450 to-indigo-600"],
    ["cat-elec", "Electronics", "💻", "from-violet-400 to-purple-600"],
    ["cat-travel", "Travel", "✈️", "from-emerald-450 to-teal-600"],
    ["cat-emergency", "Emergency Fund", "⭐", "from-rose-400 to-pink-500"],
];

$stmt = $pdo->prepare("REPLACE INTO SavingsCategory (id, name, icon, color) VALUES (?, ?, ?, ?)");
foreach ($categories as $cat) {
    $stmt->execute($cat);
}

echo json_encode(["status" => "re-seeded", "data" => $pdo->query("SELECT * FROM SavingsCategory")->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);