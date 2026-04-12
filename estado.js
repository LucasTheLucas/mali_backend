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

    Estado.sequelize.sync({ force: false })

    //module.exports = Estado;