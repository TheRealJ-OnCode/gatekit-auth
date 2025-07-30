const auth_login = (req,res) =>{
    res.send("/login POST")

}
const auth_register = (req,res) =>{
    res.send("/register POST")
}

module.exports = {
    auth_login,
    auth_register
}