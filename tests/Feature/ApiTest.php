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
            'days_together', 'photos', 'km', 'countries', 'cities', 'bucket_done', 'bucket_total',
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
            'tags'       => ['cestovanie'],
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
}
