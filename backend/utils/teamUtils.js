function generateTeamIdFromName(name) {
    return name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/\./g, '_')
        .replace(/[^\w-]/g, '');
}

module.exports = { generateTeamIdFromName };
