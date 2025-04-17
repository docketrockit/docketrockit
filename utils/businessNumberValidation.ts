const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

export const isValidABN = (abn: string): boolean => {
    if (!/^\d{11}$/.test(abn)) return false;

    const digits = abn.split('').map(Number);
    digits[0] -= 1;

    const total = digits.reduce((sum, digit, index) => {
        return sum + digit * ABN_WEIGHTS[index];
    }, 0);

    return total % 89 === 0;
};

export const isValidACN = (acn: string): boolean => {
    if (!/^\d{9}$/.test(acn)) return false;

    const digits = acn.split('').map(Number);
    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    const sum = weights.reduce((acc, weight, i) => acc + digits[i] * weight, 0);

    const remainder = sum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;

    return checkDigit === digits[8];
};

export const formatABN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{3})?/, (_, a, b, c, d) =>
        [a, b, c, d].filter(Boolean).join(' ')
    );
};

export const formatACN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    return digits.replace(/(\d{3})(\d{3})(\d{3})?/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(' ')
    );
};
