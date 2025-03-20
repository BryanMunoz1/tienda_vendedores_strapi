module.exports = {
  beforeDelete: async (event) => {
    try {
      const { where } = event.params;
      
      if (!where || !where.id) {
        return; // Sin ID válido, no podemos continuar
      }
      
      const vendedorId = where.id;
      
      // Obtener el vendedor con su tienda
      const vendedor = await strapi.entityService.findOne('api::vendedore.vendedore', vendedorId, {
        populate: {
          tienda: true
        }
      });
      
      if (!vendedor) {
        return; // Vendedor no existe, puede que ya haya sido eliminado
      }
      
      // Usar TypeScript casting para acceder a la propiedad tienda
      const vendedorData = vendedor as any;
      
      // Si no hay tienda asociada, se puede eliminar
      if (!vendedorData.tienda) {
        return;
      }
      
      const tiendaId = vendedorData.tienda.id;
      
      if (!tiendaId) {
        return; // ID de tienda no válido
      }
      
      // Verificar cuántos vendedores tiene la tienda
      const vendedoresEnTienda = await strapi.entityService.findMany('api::vendedore.vendedore', {
        filters: {
          tienda: {
            id: {
              $eq: tiendaId
            }
          },
          id: {
            $ne: vendedorId // Excluir el vendedor actual
          }
        },
      });
      
      const hasOtherVendedores = Array.isArray(vendedoresEnTienda) && vendedoresEnTienda.length > 0;
      
      if (!hasOtherVendedores) {
        throw new Error('No se puede eliminar el vendedor porque es el único asignado a esta tienda.');
      }
    } catch (error) {
      // Capturar errores inesperados pero volver a lanzar los errores de validación
      if (error instanceof Error && error.message.includes('No se puede eliminar')) {
        throw error;
      }
      console.error('Error al validar eliminación de vendedor:', error);
      throw new Error('Error al validar la eliminación del vendedor.');
    }
  }
};