<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Starting genres migration/dedupe...\n";

try {
    // 1) Add tmdb_id column if not exists
    $has = DB::selectOne("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'genres' AND COLUMN_NAME = 'tmdb_id'");
    if (!$has) {
        echo "Adding column tmdb_id to genres...\n";
        DB::statement("ALTER TABLE genres ADD COLUMN tmdb_id INT NULL");
    } else {
        echo "Column tmdb_id already exists.\n";
    }

    // Mapping from english/spanish names to TMDB ids
    $nameToTmdb = [
        'Action' => 28, 'Acción' => 28,
        'Adventure' => 12, 'Aventura' => 12,
        'Animation' => 16, 'Animación' => 16,
        'Comedy' => 35, 'Comedia' => 35,
        'Crime' => 80, 'Crimen' => 80,
        'Documentary' => 99, 'Documental' => 99,
        'Drama' => 18, // Drama appears twice in table; both map to 18
        'Family' => 10751, 'Familia' => 10751,
        'Fantasy' => 14, 'Fantasía' => 14,
        'History' => 36, 'Historia' => 36,
        'Horror' => 27, 'Terror' => 27,
        'Mystery' => 9648, 'Misterio' => 9648,
        'Science Fiction' => 878, 'Ciencia ficción' => 878,
        'Thriller' => 53, 'Suspense' => 53,
        'Western' => 37,
        'Music' => 10402, 'Música' => 10402,
        'Romance' => 10749,
        'History' => 36
    ];

    // 2) Populate tmdb_id for existing rows
    echo "Populating tmdb_id for genres...\n";
    $genres = DB::select("SELECT id, name FROM genres");
    foreach ($genres as $g) {
        $tmdb = null;
        // If id looks like a TMDB id (>=100) use it
        if (intval($g->id) >= 100) {
            $tmdb = intval($g->id);
        } else {
            $n = trim($g->name);
            if (isset($nameToTmdb[$n])) {
                $tmdb = $nameToTmdb[$n];
            }
        }

        if ($tmdb) {
            DB::table('genres')->where('id', $g->id)->update(['tmdb_id' => $tmdb]);
            echo "- Set genre {$g->id} ({$g->name}) => tmdb_id={$tmdb}\n";
        } else {
            echo "- Skipping genre {$g->id} ({$g->name}) - no mapping\n";
        }
    }

    // 3) Find duplicates by tmdb_id and merge
    echo "Checking for duplicates by tmdb_id...\n";
    $dupes = DB::select("SELECT tmdb_id, COUNT(*) as cnt FROM genres WHERE tmdb_id IS NOT NULL GROUP BY tmdb_id HAVING cnt > 1");
    foreach ($dupes as $d) {
        $tmdb = $d->tmdb_id;
        echo "- Duplicates for tmdb_id={$tmdb} (count={$d->cnt})\n";
        $rows = DB::select("SELECT id FROM genres WHERE tmdb_id = ? ORDER BY id", [$tmdb]);
        $keep = $rows[0]->id;
        echo "  Keeping id={$keep}\n";
        for ($i = 1; $i < count($rows); $i++) {
            $del = $rows[$i]->id;
            // Repoint user_favorite_genres safely (avoid unique constraint violations)
            echo "  Repointing user_favorite_genres from {$del} -> {$keep}...\n";
            $userPivots = DB::table('user_favorite_genres')->where('genre_id', $del)->get();
            foreach ($userPivots as $rp) {
                $exists = DB::table('user_favorite_genres')
                    ->where('user_id', $rp->user_id)
                    ->where('genre_id', $keep)
                    ->exists();
                if ($exists) {
                    DB::table('user_favorite_genres')
                        ->where('user_id', $rp->user_id)
                        ->where('genre_id', $del)
                        ->delete();
                } else {
                    DB::table('user_favorite_genres')
                        ->where('user_id', $rp->user_id)
                        ->where('genre_id', $del)
                        ->update(['genre_id' => $keep]);
                }
            }

            // Repoint movie_genres safely (only if table exists)
            $hasMovieGenres = DB::selectOne("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movie_genres'");
            if ($hasMovieGenres) {
                echo "  Repointing movie_genres from {$del} -> {$keep}...\n";
                $moviePivots = DB::table('movie_genres')->where('genre_id', $del)->get();
                foreach ($moviePivots as $mp) {
                    $existsM = DB::table('movie_genres')
                        ->where('movie_id', $mp->movie_id)
                        ->where('genre_id', $keep)
                        ->exists();
                    if ($existsM) {
                        DB::table('movie_genres')
                            ->where('movie_id', $mp->movie_id)
                            ->where('genre_id', $del)
                            ->delete();
                    } else {
                        DB::table('movie_genres')
                            ->where('movie_id', $mp->movie_id)
                            ->where('genre_id', $del)
                            ->update(['genre_id' => $keep]);
                    }
                }
            } else {
                echo "  Skipping movie_genres (table not found).\n";
            }

            // Delete duplicate genre
            DB::table('genres')->where('id', $del)->delete();
            echo "  Deleted duplicate genre id={$del}\n";
        }
    }

    echo "Genres migration/dedupe finished.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
