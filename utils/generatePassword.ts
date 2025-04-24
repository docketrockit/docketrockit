const generatePassword = (length: number) => {
    if (length < 4) {
        throw new Error(
            'Password length must be at least 4 to include all character types.'
        );
    }

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const getRandomChar = (chars: string) =>
        chars[Math.floor(Math.random() * chars.length)];

    const requiredChars = [
        getRandomChar(uppercaseChars),
        getRandomChar(lowercaseChars),
        getRandomChar(numberChars),
        getRandomChar(symbolChars)
    ];

    const allChars =
        uppercaseChars + lowercaseChars + numberChars + symbolChars;
    const remainingLength = length - requiredChars.length;

    const remainingChars = Array.from({ length: remainingLength }, () =>
        getRandomChar(allChars)
    );

    // Combine and shuffle all characters
    const finalPasswordArray = [...requiredChars, ...remainingChars];

    // Fisher-Yates shuffle
    for (let i = finalPasswordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalPasswordArray[i], finalPasswordArray[j]] = [
            finalPasswordArray[j],
            finalPasswordArray[i]
        ];
    }

    return finalPasswordArray.join('');
};

export default generatePassword;
