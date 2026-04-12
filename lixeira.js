const db = require("./db") 

const Lixeira = db.sequelize.define('lixeira',
    {
        tipolixeira:
        {
            type: db.Sequelize.TEXT
        },
        referencia:
        {
            type: db.Sequelize.TEXT
        },
        numero:
        {
            type: db.Sequelize.INTEGER
        },
        codrua:
        {
            type: db.Sequelize.INTEGER
        },
        coordenadax:
        {
            type: db.Sequelize.TEXT
        },
        coordenaday:
        {
            type: db.Sequelize.TEXT
        }
    })

Lixeira.sequelize.sync({ force: false })

//module.exports = Lixeira;