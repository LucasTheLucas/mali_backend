const db = require("./db") 

const Pais = db.sequelize.define('pais',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        }
    })

module.exports = Pais;