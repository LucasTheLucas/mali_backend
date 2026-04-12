const db = require("./db") 

const Bairro = db.sequelize.define('bairro',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        },
        codcidade:
        {
            type: db.Sequelize.INTEGER
        }
    })

    Bairro.sequelize.sync({ force: false })
//module.exports = Bairro;