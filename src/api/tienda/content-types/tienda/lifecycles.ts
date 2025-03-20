module.exports = {
  beforeCreate: async (event) => {
    // No podemos validar completamente en beforeCreate, pero podemos hacer validaciones básicas
    const { data } = event.params;
    
    // Verificamos que el teléfono sea una cadena de texto válida
    if (data.telefono && typeof data.telefono !== 'string') {
      data.telefono = String(data.telefono);
    }
  },
  
  beforeUpdate: async (event) => {
    const { data, where } = event.params;
    
    // Verificamos que el teléfono sea una cadena de texto válida
    if (data.telefono && typeof data.telefono !== 'string') {
      data.telefono = String(data.telefono);
    }
    
    // Solo si está actualizando la relación con vendedores
    if (data.vendedores !== undefined) {
      // Obtener la tienda actual con sus vendedores para compararla
      try {
        const currentStore = await strapi.entityService.findOne('api::tienda.tienda', where.id, {
          populate: {
            vendedores: true
          }
        });
        
        // Verificar si currentStore existe y si tiene la propiedad vendedores
        const currentVendedores = currentStore && 'vendedores' in currentStore ? 
          (currentStore as any).vendedores : [];
        
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
        // Otros errores podrían ser problemas de DB, así que procedemos con cautela
        console.error('Error al validar vendedores:', error);
      }
    }
  },
  
  afterCreate: async (event) => {
    const { result } = event;
    
    try {
      // Verificar después de la creación que tenga al menos un vendedor
      const tiendaWithVendedores = await strapi.entityService.findOne('api::tienda.tienda', result.id, {
        populate: {
          vendedores: true
        }
      });
      
      // Usar TypeScript casting para acceder a la propiedad vendedores
      const tiendaData = tiendaWithVendedores as any;
      
      // Verificación segura de la existencia de vendedores
      const hasVendedores = 
        tiendaData && 
        tiendaData.vendedores && 
        Array.isArray(tiendaData.vendedores) && 
        tiendaData.vendedores.length > 0;
      
      if (!hasVendedores) {
        // Actualizar el estado de la tienda a 'incompleta'
        await strapi.entityService.update('api::tienda.tienda', result.id, {
          data: {
            estado: 'incompleta'
          }
        });
        console.warn(`Advertencia: La tienda ${result.id} se creó sin vendedores asignados.`);
      }
    } catch (error) {
      console.error(`Error al verificar vendedores para tienda ${result.id}:`, error);
    }
  }
};