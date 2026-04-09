const Sequelize = require('sequelize')
const sequelize = new Sequelize('mali', 'root', '123456789', 
    {
        host: 'localhost',
        dialect: 'mysql'
    })


    module.exports = 
    {
        Sequelize: Sequelize,
        sequelize: sequelize
    }