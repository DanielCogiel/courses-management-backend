import bcrypt from 'bcrypt';

export const hashPassword = (password: string, callback: (error: Error | undefined, hash: string | undefined) => void) => {
    bcrypt.genSalt(10, (error, salt) => {
        if (error) {
            callback(error, undefined);
            return;
        }
        bcrypt.hash(password, salt, (errorHash, hash) => {
            if (errorHash) {
                callback(errorHash, undefined);
                return;
            }
            callback(undefined, hash);
        });
    });
};