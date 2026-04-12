const db = require("./db") 

const Pais = db.sequelize.define('pais',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        }
    })

        Pais.sequelize.sync({ force: false })

//module.exports = Pais;