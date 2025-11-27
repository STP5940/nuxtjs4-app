import bcrypt from 'bcrypt';

// Cache the calculated salt rounds
let SALT_ROUNDS: number | null = null;

const getSaltRounds = (): number => {
    if (SALT_ROUNDS !== null) {
        return SALT_ROUNDS;
    }

    const envValue = process.env.BCRYPT_SALT_ROUNDS;
    const rounds = parseInt(envValue || '10', 10);

    // Validate and clamp the value
    if (isNaN(rounds) || rounds < 10) {
        console.warn('Salt rounds too low or invalid, using minimum 10');
        SALT_ROUNDS = 10;
    } else if (rounds > 15) {
        console.warn('Salt rounds too high, clamped to maximum 15');
        SALT_ROUNDS = 15;
    } else if (rounds > 12) {
        console.warn('Salt rounds higher than recommended (12), consider performance impact');
        SALT_ROUNDS = rounds;
    } else {
        SALT_ROUNDS = rounds;
    }

    return SALT_ROUNDS;
};

export const hashPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, getSaltRounds());
};

export const verifyPassword = (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

// Optional: Export for testing/debugging
export const getCurrentSaltRounds = (): number => getSaltRounds();