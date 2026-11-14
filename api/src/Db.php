<?php
declare(strict_types=1);

namespace Milis;

use PDO;
use PDOStatement;

/** Acceso a MySQL/MariaDB. Siempre con consultas preparadas; nunca concatenar datos en el SQL. */
final class Db
{
    private PDO $pdo;

    public function __construct(Config $config)
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $config->get('db.host'),
            (int) $config->get('db.port', 3306),
            $config->get('db.name')
        );
        $this->pdo = new PDO($dsn, (string) $config->get('db.user'), (string) $config->get('db.pass'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $this->pdo->exec("SET time_zone = '+00:00'");
    }

    public function run(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        foreach (array_values($params) as $i => $value) {
            $type = match (true) {
                is_int($value) => PDO::PARAM_INT,
                is_bool($value) => PDO::PARAM_BOOL,
                $value === null => PDO::PARAM_NULL,
                default => PDO::PARAM_STR,
            };
            $stmt->bindValue($i + 1, $value, $type);
        }
        $stmt->execute();
        return $stmt;
    }

    public function all(string $sql, array $params = []): array
    {
        return $this->run($sql, $params)->fetchAll();
    }

    public function one(string $sql, array $params = []): ?array
    {
        $row = $this->run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    public function value(string $sql, array $params = []): mixed
    {
        $value = $this->run($sql, $params)->fetchColumn();
        return $value === false ? null : $value;
    }

    /** Ejecuta un INSERT y devuelve el id generado. */
    public function insert(string $sql, array $params = []): int
    {
        $this->run($sql, $params);
        return (int) $this->pdo->lastInsertId();
    }

    /** Ejecuta $fn dentro de una transacción; si algo falla, deshace todo. */
    public function transaction(callable $fn): mixed
    {
        $this->pdo->beginTransaction();
        try {
            $result = $fn();
            $this->pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /** "?, ?, ?" para usar en un IN (...) con $count valores. */
    public static function placeholders(int $count): string
    {
        return implode(', ', array_fill(0, max(1, $count), '?'));
    }

    public static function isDuplicateKey(\PDOException $e): bool
    {
        return ($e->errorInfo[1] ?? null) === 1062;
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
