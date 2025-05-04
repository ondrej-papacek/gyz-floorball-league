export const sanitizeTeamName = (name) =>
    name
        ?.toLowerCase()
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '');

export const normalizeName = (name) =>
    name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(' ')
        .reverse()
        .join('_');
