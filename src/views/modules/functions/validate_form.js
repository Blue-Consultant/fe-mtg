
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;
const hasWordTooLong = (str, maxLength) => str.trim().split(/\s+/).some(word => word.length > maxLength);

export const validateName = (name) => {
    if (countWords(name) > 5) return 'El nombre, traducción no debe tener más de 5 palabras.';
    if (name.length > 50) return 'El nombre, traducción no debe tener más de 50 caracteres.';
    if (hasWordTooLong(name, 60)) return 'Ninguna palabra del nombre, traducción debe tener más de 60 caracteres.';
    return null;
  };

export const validateDescripcion = (descripcion = '') => {
    if (countWords(descripcion) > 150) return 'La descripción no debe tener más de 150 palabras.';
    if (hasWordTooLong(descripcion, 60)) return 'Ninguna palabra de la descripción debe tener más de 60 caracteres.';
    return null;
};

export const validateLink = (link = '') => {
    if (link.length > 100) return 'La link no debe tener más de 100 caracteres.';
    return null;
};

export const validateIcon = (icon = '') => {
    // El ícono es opcional, solo valida si hay un valor
    if (icon && icon.length > 50) return 'El ícono no debe tener más de 50 caracteres.';
    return null;
};

export const validateOrder = (order) => {
    if (order === '' || order === null || order === undefined) return 'El orden es requerido.';
    const orderNum = Number(order);
    if (isNaN(orderNum)) return 'El orden debe ser un número válido.';
    if (orderNum < 0) return 'El orden debe ser un número positivo.';
    if (!Number.isInteger(orderNum)) return 'El orden debe ser un número entero.';
    return null;
};