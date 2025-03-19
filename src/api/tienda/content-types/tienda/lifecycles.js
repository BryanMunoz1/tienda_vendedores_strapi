module.exports = {
    beforeCreate: async (event) => {
      // No podemos validar esto en beforeCreate porque la relación no existe hasta que la tienda se crea
    },
    beforeUpdate: async (event) => {
      const { data, where } = event.params;
      
      // Solo si está actualizando la relación con vendedores
      if (data.vendedores === []) {
        throw new Error('Una tienda debe tener al menos un vendedor asignado.');
      }
    },
    afterCreate: async (event) => {
      const { result } = event;
      
      // Verificar después de la creación que tenga al menos un vendedor
      const tiendaWithVendedores = await strapi.entityService.findOne('api::tienda.tienda', result.id, {
        populate: ['vendedores']
      });
      
      if (!tiendaWithVendedores.vendedores || tiendaWithVendedores.vendedores.length === 0) {
        // Puedes registrar una advertencia o establecer un estado especial
        console.warn(`Advertencia: La tienda ${result.id} se creó sin vendedores asignados.`);
      }
    }
  };