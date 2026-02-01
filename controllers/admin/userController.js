const AdminUser = require('../../models/AdminUser');

const getUser = async(req,res) => {

   try {
      const user = await AdminUser.findById(req.user.user.id).select("-password");
      if(!user){
        throw new Error("User not Found!")

      }


    res.status(200).json({ status: 'success', message: 'getUser successful' , data: user });

    
   } catch (error) {
    return res.status(500).json(error.message || "Server Error")
   }


}

const logout = async(req,res) => {
  try {
     req.user = null;
     req.session = null;
     res.status(200).json({ status: 'success', message: 'logout successful'});
    
  } catch (error) {
     return res.status(500).json(error.message || "Server Error")
  }

}

module.exports = {
    getUser,
    logout
}