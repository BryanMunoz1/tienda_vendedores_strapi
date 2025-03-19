module.exports = {
    beforeDelete: async (event) => {
      const { where } = event.params;
      const vendedorId = where.id;
      
      // Obtener el vendedor con su tienda
      const vendedor = await strapi.entityService.findOne('api::vendedore.vendedore', vendedorId, {
        populate: ['tienda']
      });
      
      if (!vendedor.tienda) {
        return; // No hay tienda asociada, se puede eliminar
      }
      
      // Verificar si es el último vendedor de la tienda
      const tiendaId = vendedor.tienda.id;
      const vendedoresEnTienda = await strapi.entityService.findMany('api::vendedore.vendedore', {
        filters: {
          tienda: {
            id: tiendaId
          }
        }
      });
      
      if (vendedoresEnTienda.length <= 1) {
        throw new Error('No se puede eliminar el vendedor porque es el único asignado a esta tienda.');
      }
    }
  };