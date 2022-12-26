import { DataTypes, Model, Sequelize } from 'sequelize'

const sequelize =
    new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}` +
        `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`);

(async () => {
    try {
        await sequelize.authenticate()
        console.log('Connection to postgres has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
})()

class _User extends Model {
    declare id: number
    declare name: string
    declare studnumber: string
    declare age: number
    declare isadmin: boolean
}

class _Task extends Model {
    declare id: number
    declare description: string
    declare assigned: number
}

_User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    studnumber: {
        type: DataTypes.STRING(24),
        allowNull: false,
        unique: true
    },
    age: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
},
    {
        tableName: 'users',
        timestamps: false,
        sequelize,
    })


_Task.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.STRING(512),
        allowNull: false,
    },
    assigned: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
},
    {
        tableName: 'tasks',
        timestamps: false,
        sequelize,
    })

_User.hasMany(_Task)
_Task.belongsTo(_User)


export const User = _User
export const Task = _Task