const db = require("./db") 

const LixeiraMovimento = db.sequelize.define('lixeiramovimento',
    {
        codlixeira:
        {
            type: db.Sequelize.INTEGER
        },
        porcentagem:
        {
            type: db.Sequelize.DECIMAL
        },
        data:
        {
            type: db.Sequelize.DATE
        }
    })

        LixeiraMovimento.sequelize.sync({ force: false })

//module.exports = LixeiraMovimento;