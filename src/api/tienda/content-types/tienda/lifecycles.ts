module.exports = {
  beforeCreate: async (event) => {
    // Validaciones básicas
    const { data } = event.params;
    
    if (data.telefono && typeof data.telefono !== 'string') {
      data.telefono = String(data.telefono);
    }
  },
  
  beforeUpdate: async (event) => {
    const { data, where } = event.params;
    
    if (data.telefono && typeof data.telefono !== 'string') {
      data.telefono = String(data.telefono);
    }
    
    // Solo validar vendedores si se está actualizando esa relación
    if (data.vendedores !== undefined) {
      try {
        // Consulta más eficiente que solo recupera el ID de los vendedores
        const currentStore = await strapi.db.query('api::tienda.tienda').findOne({
          where: { id: where.id },
          populate: { vendedores: { select: ['id'] } },
        });
        
        const currentVendedores = currentStore && currentStore.vendedores || [];
        
        const isEmptyingVendedores = 
          (!data.vendedores || data.vendedores.length === 0) && 
          Array.isArray(currentVendedores) && currentVendedores.length > 0;
        
        if (isEmptyingVendedores) {
          throw new Error('Una tienda debe tener al menos un vendedor asignado.');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Una tienda debe tener')) {
          throw error;
        }
        console.error('Error al validar vendedores:', error);
      }
    }
  },
  
  afterCreate: async (event) => {
    const { result } = event;
    
    try {
      // Consulta optimizada
      const tiendaWithVendedores = await strapi.db.query('api::tienda.tienda').findOne({
        where: { id: result.id },
        populate: { vendedores: { select: ['id'] } },
      });
      
      const hasVendedores = 
        tiendaWithVendedores && 
        tiendaWithVendedores.vendedores && 
        Array.isArray(tiendaWithVendedores.vendedores) && 
        tiendaWithVendedores.vendedores.length > 0;
      
      if (!hasVendedores) {
        await strapi.db.query('api::tienda.tienda').update({
          where: { id: result.id },
          data: { estado: 'incompleta' }
        });
        console.warn(`Advertencia: La tienda ${result.id} se creó sin vendedores asignados.`);
      }
    } catch (error) {
      console.error(`Error al verificar vendedores para tienda ${result.id}:`, error);
    }
  }
};