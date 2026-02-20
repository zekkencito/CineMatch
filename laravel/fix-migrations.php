try {
  $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s", getenv("DB_HOST"), getenv("DB_PORT") ?: 3306, getenv("DB_DATABASE"));
  $pdo = new PDO($dsn, getenv("DB_USERNAME"), getenv("DB_PASSWORD"), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $pdo->exec("CREATE TABLE IF NOT EXISTS migrations (id int unsigned NOT NULL AUTO_INCREMENT, migration varchar(255) NOT NULL, batch int NOT NULL, PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4");
  $check = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='personal_access_tokens'")->fetchColumn();
  if ($check > 0) {
    $pdo->exec("INSERT IGNORE INTO migrations (migration, batch) VALUES ('2019_12_14_000001_create_personal_access_tokens_table', 1)");
    echo "Sanctum migration record ensured\n";
  }
} catch(Exception $e) { echo "Pre-fix error: " . $e->getMessage() . "\n"; }
