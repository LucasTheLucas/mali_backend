const db = require("./db") 

const Coleta = db.sequelize.define('coleta',
    {
        codusuario:
        {
            type: db.Sequelize.INTEGER
        },
        codlixeira:
        {
            type: db.Sequelize.INTEGER
        },
        datahora:
        {
            type: db.Sequelize.DATE
        },
        kg:
        {
            type: db.Sequelize.DECIMAL
        }
    })

module.exports = Coleta;