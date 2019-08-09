// Imports
const Controller = require("../structure/Controller.js");



/**
 *
 */
class SystemController extends Controller {

    constructor() {
        super()
    }

    navigation(request, response) {
        if(typeof request.session.user === "undefined") {
            response.json({
                success: false,
                message: "Access denied",
                error: ["accessDenied"]
            });
            return;
        }

        response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        response.header('Expires', '-1');
        response.header('Pragma', 'no-cache');

        var menuItems = {};
        var compiledSections = {};
        const userID = request.session.user.ID
        const sections = JSON.parse(JSON.stringify(require("../../app/menus.json")))
        const sectionKeys = Object.keys(sections)
        const query = "SELECT P.permission_id AS permissionID FROM Permission P JOIN `Role-Permission` RP ON P.permission_id = RP.permission_id JOIN Role R ON RP.role_id = R.role_id JOIN `User-Role` UR ON R.role_id = UR.role_id WHERE R.company_id = (SELECT company_id FROM User WHERE user_id = ?) AND UR.user_id = ? GROUP BY P.permission_id"
        
        global.database.query(query, [userID, userID], (error, rows, fields) => {
        if (error) {
            response.json({
                success: false,
                message: "Database error",
                error: ["databaseError"]
            });
            return;
        } else {
            request.session.permissions = []
            for (let i = 0; i < rows.length; i++) {
                request.session.permissions.push(rows[i].permissionID)
            }
            const permissions = typeof(request.session.permissions) === "undefined" ? [] : request.session.permissions
                for(var i = 0; i < sectionKeys.length; i++) {
                    const sectionKey = sectionKeys[i]
                    const section = sections[sectionKey];
                    menuItems[sectionKey] = section;
                    for(var j = 0; j < section.length; j++) {
                        const row = section[j]
                        
                        // Handle children
                        if(row.hasOwnProperty("dropdown")) {
                            compiledSections[sectionKey] = typeof(compiledSections[sectionKey]) === "object" ? compiledSections[sectionKey] : []
                            compiledSections[sectionKey].push(row);
                            if(compiledSections[sectionKey].length > 0) {
                                const dropdownTemp = JSON.parse(JSON.stringify(row.dropdown))
                                row.dropdown = []
                                for(var k = 0; k < dropdownTemp.length; k++) {
                                    const childRow = dropdownTemp[k]
                                    if(childRow.hasOwnProperty("permission")) {
                                        if(childRow.permission.length > 0) {
                                            for(var l = 0; l < permissions.length; l++) {
                                                const permission = permissions[l]
                                                if(childRow.permission.includes(permission)) {
                                                    row.dropdown.push(childRow);
                                                }
                                            }
                                        } else {
                                            row.dropdown.push(childRow);
                                        }
                                    }
                                }
                                if(row.dropdown.length === 0) {
                                    compiledSections[sectionKey].pop();
                                }
                            }
                        } else {
                            if(row.hasOwnProperty("permission")) {
                                if(row.permission.length > 0) {
                                    for(var l = 0; l < permissions.length; l++) {
                                        const permission = permissions[l]
                                        if(row.permission.includes(permission)) {
                                            compiledSections[sectionKey] = typeof(compiledSections[sectionKey]) === "object" ? compiledSections[sectionKey] : []
                                            compiledSections[sectionKey].push(row);
                                        }
                                    }
                                } else {
                                    compiledSections[sectionKey] = typeof(compiledSections[sectionKey]) === "object" ? compiledSections[sectionKey] : []
                                    compiledSections[sectionKey].push(row);
                                }
                            }
                        }
                    }
                }
        
                response.json({
                    success: true,
                    message: "Navigation",
                    data: compiledSections
                });
                return;
            }
        });
    }
}



module.exports = SystemController