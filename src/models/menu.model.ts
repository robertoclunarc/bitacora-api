import pool from '../config/database';
import { Menu } from '../types/interfaces';

export const findAll = async (): Promise<Menu[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM menus ORDER BY orden, idpadre NULLS FIRST, idmenu');
    return rows as Menu[];
  } catch (error) {
    console.error('Error en findAll menus:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Menu | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM menus WHERE idmenu = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Menu;
  } catch (error) {
    console.error(`Error en findById menu ${id}:`, error);
    throw error;
  }
};

export const findByParent = async (parentId: number | null, login: string): Promise<Menu[]> => {
  try {
    let query = 'SELECT * FROM menus WHERE idpadre ';
    
    if (parentId === null) {
      query += 'IS NULL';
      const [rows] = await pool.query(query);
      return rows as Menu[];
    } else {
      query += '= ? AND estatus = 1 and idmenu IN (SELECT idmenu FROM menus_usuarios WHERE estatus = "ACTIVO" AND login = ?) ORDER BY orden';
      const [rows] = await pool.query(query, [parentId, login]);
      return rows as Menu[];
    }
  } catch (error) {
    console.error(`Error en findByParent menu ${parentId}:`, error);
    throw error;
  }
};

export const create = async (menu: Menu): Promise<number> => {
  try {
    const {
      idpadre,
      name,
      url,
      href,
      icon,
      badge_text,
      badge_variant,
      badge_class,
      variant,
      attributes,
      attributes_element,
      divider,
      class: className,
      label_class,
      label_variant,
      wrapper_attributes,
      wrapper_element,
      linkprops,
      title,
      estatus,
      orden
    } = menu;
    
    const [result]: any = await pool.query(
      `INSERT INTO menus (
        idpadre, name, url, href, icon, badge_text, badge_variant,
        badge_class, variant, attributes, attributes_element, divider,
        class, label_class, label_variant, wrapper_attributes,
        wrapper_element, linkprops, title, estatus, orden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idpadre,
        name,
        url,
        href,
        icon,
        badge_text,
        badge_variant,
        badge_class,
        variant,
        attributes,
        attributes_element,
        divider,
        className,
        label_class,
        label_variant,
        wrapper_attributes,
        wrapper_element,
        linkprops,
        title,
        estatus !== undefined ? estatus : true,
        orden
      ]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create menu:', error);
    throw error;
  }
};

export const update = async (id: number, menu: Menu): Promise<boolean> => {
  try {
    const {
      idpadre,
      name,
      url,
      href,
      icon,
      badge_text,
      badge_variant,
      badge_class,
      variant,
      attributes,
      attributes_element,
      divider,
      class: className,
      label_class,
      label_variant,
      wrapper_attributes,
      wrapper_element,
      linkprops,
      title,
      estatus,
      orden
    } = menu;
    
    // Verificar que no se asigne a sí mismo como padre
    if (idpadre === id) {
      throw new Error('Un menú no puede ser su propio padre');
    }
    
    // Verificar que no se cree un ciclo en la jerarquía
    if (idpadre !== null) {
      let currentParentId = idpadre;
      while (currentParentId !== null) {
        const [parent]: any = await pool.query('SELECT idpadre FROM menus WHERE idmenu = ?', [currentParentId]);
        
        if (parent.length === 0) {
          break;
        }
        
        if (parent[0].idpadre === id) {
          throw new Error('La actualización crearía un ciclo en la jerarquía de menús');
        }
        
        currentParentId = parent[0].idpadre;
      }
    }
    
    const [result]: any = await pool.query(
      `UPDATE menus SET 
        idpadre = ?, name = ?, url = ?, href = ?, icon = ?,
        badge_text = ?, badge_variant = ?, badge_class = ?,
        variant = ?, attributes = ?, attributes_element = ?,
        divider = ?, class = ?, label_class = ?,
        label_variant = ?, wrapper_attributes = ?,
        wrapper_element = ?, linkprops = ?, title = ?,
        estatus = ?, orden = ?
      WHERE idmenu = ?`,
      [
        idpadre,
        name,
        url,
        href,
        icon,
        badge_text,
        badge_variant,
        badge_class,
        variant,
        attributes,
        attributes_element,
        divider,
        className,
        label_class,
        label_variant,
        wrapper_attributes,
        wrapper_element,
        linkprops,
        title,
        estatus,
        orden,
        id
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update menu ${id}:`, error);
    throw error;
  }
};

export const updateStatus = async (id: number, estatus: boolean): Promise<boolean> => {
  try {
    const [result]: any = await pool.query(
      'UPDATE menus SET estatus = ? WHERE idmenu = ?',
      [estatus, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en updateStatus menu ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    // Verificar si tiene hijos
    const [children]: any = await pool.query('SELECT COUNT(*) as count FROM menus WHERE idpadre = ?', [id]);
    
    if (children[0].count > 0) {
      throw new Error('No se puede eliminar un menú con submenús asociados');
    }
    
    // Verificar si tiene permisos de usuario asociados
    const [permissions]: any = await pool.query('SELECT COUNT(*) as count FROM menus_usuarios WHERE idmenu = ?', [id]);
    
    if (permissions[0].count > 0) {
      throw new Error('No se puede eliminar un menú con permisos de usuarios asociados');
    }
    
    const [result]: any = await pool.query('DELETE FROM menus WHERE idmenu = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove menu ${id}:`, error);
    throw error;
  }
};

export const getMenusByUser = async (login: string): Promise<Menu[]> => {
  try {
    const [rows] = await pool.query(
      `SELECT m.* FROM menus m
       INNER JOIN menus_usuarios mu ON m.idmenu = mu.idmenu
       WHERE mu.login = ? AND m.estatus = true AND mu.estatus = 'ACTIVO'
       ORDER BY m.orden, m.idpadre NULLS FIRST, m.idmenu`,
      [login]
    );
    return rows as Menu[];
  } catch (error) {
    console.error(`Error en getMenusByUser ${login}:`, error);
    throw error;
  }
};

export const getMenuTree = async (login: string): Promise<Menu[]> => {
  try {
    // Obtener menús raíz (sin padre)
    const rootMenus = await findByParent(0, login);
    
    // Función para agregar hijos a cada menú
    const addChildren = async (menu: Menu): Promise<Menu> => {
      const children = await findByParent(menu.idmenu!, login);
      
      if (children.length > 0) {
        // Agregar recursivamente hijos a cada hijo
        const childrenWithSubchildren = await Promise.all(
          children.map(child => addChildren(child))
        );
        
        return { ...menu, children: childrenWithSubchildren };
      }
      
      return menu;
    };
    
    // Agregar hijos a cada menú raíz
    const menuTree = await Promise.all(
      rootMenus.map(rootMenu => addChildren(rootMenu))
    );
    
    return menuTree;
  } catch (error) {
    console.error('Error en getMenuTree:', error);
    throw error;
  }
};