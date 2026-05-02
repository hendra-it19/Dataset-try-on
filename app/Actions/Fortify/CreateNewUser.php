<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'height' => ['required', 'integer', 'min:50', 'max:300'],
            'weight' => ['required', 'integer', 'min:20', 'max:300'],
            'age' => ['required', 'integer', 'min:1', 'max:150'],
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'height' => $input['height'],
            'weight' => $input['weight'],
            'age' => $input['age'],
            'role' => 'user',
            'password' => $input['password'],
        ]);
    }
}
