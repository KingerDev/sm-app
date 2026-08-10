<?php

namespace Tests\Feature;

use App\Models\Capsule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): User
    {
        return User::factory()->create(['name' => 'M', 'email' => 'm@sm.app']);
    }

    public function test_api_requires_auth(): void
    {
        $this->getJson('/api/v1/stats')->assertUnauthorized();
        $this->getJson('/api/v1/moments')->assertUnauthorized();
    }

    public function test_login_and_stats(): void
    {
        $user = User::factory()->create(['password' => 'tajneheslo']);

        $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'tajneheslo',
        ])->assertOk();

        $this->getJson('/api/v1/stats')->assertOk()->assertJsonStructure([
            'days_together', 'photos', 'countries', 'cities', 'bucket_done', 'bucket_total',
        ]);
    }

    public function test_moment_crud_generates_slug_and_slovak_dates(): void
    {
        $this->actingAs($this->actingUser());

        $res = $this->postJson('/api/v1/moments', [
            'title'      => 'Víkend vo Viedni',
            'place'      => 'Viedeň · Rakúsko',
            'date_start' => '2026-04-12',
            'date_end'   => '2026-04-14',
            'who'        => 'S',
        ])->assertCreated();

        $slug = $res->json('slug');
        $this->assertSame('vikend-vo-viedni', $slug);
        $this->assertSame('12. – 14. apríl 2026', $res->json('date_display'));
        $this->assertSame('apr 2026', $res->json('date_short'));

        $this->patchJson("/api/v1/moments/{$slug}", ['title' => 'Viedeň inak'])
            ->assertOk()
            ->assertJsonPath('title', 'Viedeň inak');

        $this->deleteJson("/api/v1/moments/{$slug}")->assertNoContent();
        $this->getJson("/api/v1/moments/{$slug}")->assertNotFound();
    }

    public function test_photo_upload_is_optimized_to_webp_with_thumbnail(): void
    {
        \Storage::fake('public');
        $this->actingAs($this->actingUser());

        $moment = \App\Models\Moment::create([
            'slug' => 'foto-test', 'title' => 'Foto test', 'place' => 'doma',
            'place_short' => 'doma', 'date_start' => '2026-07-01',
            'date_display' => '1. júl 2026', 'date_short' => 'júl 2026', 'seed' => 'home',
        ]);

        $file = \Illuminate\Http\Testing\File::image('velka.jpg', 4000, 3000);

        $res = $this->post('/api/v1/photos', [
            'type' => 'moment', 'id' => $moment->id, 'files' => [$file],
        ], ['Accept' => 'application/json'])->assertCreated();

        $photo = \App\Models\Photo::first();
        $this->assertStringEndsWith('.webp', $photo->path);
        $this->assertStringEndsWith('-thumb.webp', $photo->thumb_path);
        \Storage::disk('public')->assertExists($photo->path);
        \Storage::disk('public')->assertExists($photo->thumb_path);

        // hlavná fotka zmenšená na max 2560 px
        [$w, $h] = getimagesizefromstring(\Storage::disk('public')->get($photo->path));
        $this->assertLessThanOrEqual(2560, max($w, $h));

        // miniatúra max 480 px
        [$tw, $th] = getimagesizefromstring(\Storage::disk('public')->get($photo->thumb_path));
        $this->assertLessThanOrEqual(480, max($tw, $th));

        $this->assertArrayHasKey('thumb_url', $res->json()[0]);
    }

    public function test_cover_photo_moves_to_front(): void
    {
        \Storage::fake('public');
        $this->actingAs($this->actingUser());

        $moment = \App\Models\Moment::create([
            'slug' => 'cover-test', 'title' => 'Cover test', 'place' => 'doma',
            'place_short' => 'doma', 'date_start' => '2026-07-01',
            'date_display' => '1. júl 2026', 'date_short' => 'júl 2026', 'seed' => 'home',
        ]);

        $this->post('/api/v1/photos', [
            'type' => 'moment', 'id' => $moment->id,
            'files' => [
                \Illuminate\Http\Testing\File::image('prva.jpg', 800, 600),
                \Illuminate\Http\Testing\File::image('druha.jpg', 800, 600),
            ],
        ], ['Accept' => 'application/json'])->assertCreated();

        [$first, $second] = \App\Models\Photo::orderBy('id')->get();

        $this->patchJson("/api/v1/photos/{$second->id}/cover")->assertOk();

        $photos = $this->getJson('/api/v1/moments/cover-test')->json('photos');
        $this->assertSame($second->id, $photos[0]['id']);
        $this->assertTrue($photos[0]['is_cover']);

        // prepnutie na prvú zruší cover druhej
        $this->patchJson("/api/v1/photos/{$first->id}/cover")->assertOk();
        $photos = $this->getJson('/api/v1/moments/cover-test')->json('photos');
        $this->assertSame($first->id, $photos[0]['id']);
        $this->assertFalse($photos[1]['is_cover']);
    }

    public function test_locked_capsule_hides_content(): void
    {
        $this->actingAs($this->actingUser());

        Capsule::create([
            'slug' => 'tajna', 'title' => 'Tajná kapsula', 'by' => 'M',
            'created_date' => now()->subDay(), 'unlock_date' => now()->addYear(),
            'has_letter' => true, 'letter' => 'Tajný list, ktorý nesmie uniknúť.',
            'seed' => 'home',
        ]);

        $this->getJson('/api/v1/capsules/tajna')
            ->assertOk()
            ->assertJsonPath('is_unlocked', false)
            ->assertJsonPath('letter', null);

        Capsule::where('slug', 'tajna')->update(['unlock_date' => now()->subDay()]);

        $this->getJson('/api/v1/capsules/tajna')
            ->assertOk()
            ->assertJsonPath('is_unlocked', true)
            ->assertJsonPath('letter', 'Tajný list, ktorý nesmie uniknúť.');
    }

    public function test_events_include_derived_anniversaries_and_custom(): void
    {
        $this->actingAs($this->actingUser());

        \DB::table('settings')->insert([
            'key' => 'together_since', 'value' => now()->subYears(2)->toDateString(),
        ]);

        $this->postJson('/api/v1/events', [
            'title' => 'Výlet do Ríma', 'date' => now()->addMonth()->toDateString(), 'kind' => 'plan',
        ])->assertCreated();

        $events = $this->getJson('/api/v1/events')->assertOk()->json();

        $kinds = array_unique(array_column($events, 'kind'));
        $this->assertContains('anniv', $kinds);
        $this->assertContains('milestone', $kinds);
        $this->assertContains('plan', $kinds);
    }

    public function test_monthly_collage_is_generated_from_moment_photos(): void
    {
        \Storage::fake('public');
        $this->actingAs($this->actingUser());

        $moment = \App\Models\Moment::create([
            'slug' => 'kolaz-test', 'title' => 'Koláž test', 'place' => 'Praha',
            'place_short' => 'Praha', 'date_start' => '2026-03-14', 'date_display' => '14. marec 2026',
            'date_short' => 'mar 2026', 'seed' => 'default',
        ]);

        // Dve skutočné fotky na disku — koláž ich musí vedieť načítať a poskladať.
        foreach ([1, 2] as $i) {
            $img = imagecreatetruecolor(600, 400);
            imagefill($img, 0, 0, imagecolorallocate($img, 40 * $i, 90, 60));
            ob_start();
            imagejpeg($img);
            $bytes = ob_get_clean();

            $path = "photos/moments/kolaz-{$i}.jpg";
            \Storage::disk('public')->put($path, $bytes);
            $moment->photos()->create(['path' => $path, 'kind' => 'image', 'sort_order' => $i]);
        }

        $res = $this->getJson('/api/v1/wrapped/2026-03/collage')->assertOk();
        $this->assertSame(2, $res->json('photos'));
        $this->assertNotNull($res->json('url'), 'koláž sa nevygenerovala');

        // Súbor musí naozaj vzniknúť a mať rozmery story
        $files = \Storage::disk('public')->files('collages');
        $this->assertCount(1, $files);
        [$w, $h] = getimagesizefromstring(\Storage::disk('public')->get($files[0]));
        $this->assertSame([1080, 1920], [$w, $h]);
    }

    public function test_collage_for_unknown_month_is_not_found(): void
    {
        $this->actingAs($this->actingUser());
        $this->getJson('/api/v1/wrapped/1999-01/collage')->assertNotFound();
    }

    public function test_collage_can_be_created_listed_and_deleted(): void
    {
        \Storage::fake('public');
        $this->actingAs($this->actingUser());

        $moment = \App\Models\Moment::create([
            'slug' => 'navsteva-demanovskej-jaskyne-slobody-teda-vlastne-lumina-verse-2026', 'title' => 'Praha', 'place' => 'Praha',
            'place_short' => 'Praha', 'date_start' => '2026-05-02', 'date_display' => '2. máj 2026',
            'date_short' => 'máj 2026', 'seed' => 'default',
        ]);

        foreach ([1, 2, 3] as $i) {
            $img = imagecreatetruecolor(500, 500);
            imagefill($img, 0, 0, imagecolorallocate($img, 30 * $i, 90, 60));
            ob_start();
            imagejpeg($img);
            $bytes = ob_get_clean();
            $path = "photos/moments/flow-{$i}.jpg";
            \Storage::disk('public')->put($path, $bytes);
            $moment->photos()->create(['path' => $path, 'kind' => 'image', 'sort_order' => $i]);
        }

        // šablóny sa dajú vypýtať
        $this->getJson('/api/v1/collages/templates')
            ->assertOk()
            ->assertJsonFragment(['key' => 'tape']);

        // vytvorenie z momentu
        $res = $this->postJson('/api/v1/collages', [
            'template' => 'tape',
            'title' => 'Praha 2026',
            'subtitle' => 'prvý spoločný výlet',
            'source_type' => 'moment',
            'source_id' => 'navsteva-demanovskej-jaskyne-slobody-teda-vlastne-lumina-verse-2026',
        ])->assertCreated();

        $id = $res->json('id');
        $this->assertSame(3, $res->json('photos_count'));
        $this->assertStringContainsString('collages/', $res->json('path'));

        [$w, $h] = getimagesizefromstring(\Storage::disk('public')->get($res->json('path')));
        $this->assertSame([1080, 1920], [$w, $h]);

        $this->getJson('/api/v1/collages')->assertOk()->assertJsonCount(1);

        // zmazanie odstráni aj súbor
        $path = $res->json('path');
        $this->deleteJson("/api/v1/collages/{$id}")->assertNoContent();
        $this->assertFalse(\Storage::disk('public')->exists($path), 'súbor koláže zostal na disku');
        $this->getJson('/api/v1/collages')->assertOk()->assertJsonCount(0);
    }

    public function test_collage_without_photos_is_rejected(): void
    {
        \Storage::fake('public');
        $this->actingAs($this->actingUser());

        $this->postJson('/api/v1/collages', [
            'template' => 'grid',
            'title' => 'Prázdno',
            'source_type' => 'moment',
            'source_id' => 'neexistuje',
        ])->assertStatus(422);
    }
}
