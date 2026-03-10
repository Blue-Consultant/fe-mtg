import classnames from "classnames";

/**
 * Genera nombres de clases CSS globales de forma consistente
 * @param {string} rootClass - La clase base
 * @param {string|object} options - Opciones como string o objeto
 * @returns {string} - Clase CSS generada
 */
export const getGlobalClassName = (rootClass, options) => {
  if (typeof options === "string") {
    return `${rootClass}-${options}`;
  } else {
    const mappedOptions = {};
    for (let option in options) {
      mappedOptions[`${rootClass}--${option}`] = options[option];
    }

    return classnames({
      [rootClass]: true,
      ...mappedOptions,
    });
  }
};

/**
 * Factory function que crea una función personalizada para manejar clases CSS
 * @param {string} rootClass - La clase base (ej: "button", "card", "modal")
 * @param {object} styles - Objeto que mapea nombres de clases a valores CSS reales
 * @param {object} config - Configuración opcional con baseClass
 * @returns {function} - Función para generar clases CSS
 */
const getClassNameFactory = (
  rootClass,
  styles,
  config = { baseClass: "" }
) => {
  return (options = {}) => {
    if (typeof options === "string") {
      const descendant = options;
      const style = styles[`${rootClass}-${descendant}`];

      if (style) {
        return config.baseClass + styles[`${rootClass}-${descendant}`] || "";
      }

      return "";
    } else if (typeof options === "object") {
      const modifiers = options;
      const prefixedModifiers = {};

      for (let modifier in modifiers) {
        prefixedModifiers[styles[`${rootClass}--${modifier}`]] =
          modifiers[modifier];
      }

      const c = styles[rootClass];

      return (
        config.baseClass +
        classnames({
          [c]: !!c, // solo aplicar la clase si existe
          ...prefixedModifiers,
        })
      );
    } else {
      return config.baseClass + styles[rootClass] || "";
    }
  };
};

export default getClassNameFactory; 