'use strict';

/**
 * tienda controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::tienda.tienda', ({ strapi }) => ({
  // Sobrescribe el método delete
  async delete(ctx) {
    const { id } = ctx.params;
    
    // Verificar si la tienda tiene vendedores
    const tienda = await strapi.entityService.findOne('api::tienda.tienda', id, {
      populate: ['vendedores']
    });
    
    // Si la tienda no tiene vendedores, permitir la eliminación
    if (!tienda.vendedores || tienda.vendedores.length === 0) {
      return await super.delete(ctx);
    }
    
    // Si la tienda tiene vendedores, mostrar un error
    return ctx.badRequest('No se puede eliminar una tienda que tenga vendedores asignados. Primero reasigne o elimine los vendedores.');
  }
}));