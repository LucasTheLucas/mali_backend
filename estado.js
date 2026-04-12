const db = require("./db") 

const Estado = db.sequelize.define('estado',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        },
        codpais:
        {
            type: db.Sequelize.INTEGER
        }
    })

    module.exports = Estado;