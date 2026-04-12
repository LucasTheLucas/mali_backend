const db = require("./db") 

const Rua = db.sequelize.define('rua',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        },
        codbairro:
        {
            type: db.Sequelize.INTEGER
        }
    })

    Rua.sequelize.sync({ force: false })

    //module.exports = Rua;