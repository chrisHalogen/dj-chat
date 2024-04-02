import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuthServiceContext } from "../context/AuthContext";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

const Login = () => {
  const { login } = useAuthServiceContext();

  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const errors: Partial<typeof values> = {};
      if (!values.username) {
        errors.username = "Required";
      }
      if (!values.password) {
        errors.password = "Required";
      }
      return errors;
    },
    onSubmit: async (values) => {
      const { username, password } = values;
      const status = await login(username, password);
      if (status === 401) {
        console.log("Unaluthorized");

        formik.setErrors({
          username: "Invalid Username or Password",
          password: "Invalid Username or Password",
        });
      } else {
        navigate("/");
      }

      // console.log("result = ", res);

      // if (res == 1) {
      //   navigate("/testlogin");
      // } else {
      //   console.log("res = ", res);
      // }
    },
  });
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h5"
          noWrap
          component="h1"
          sx={{ fontWeight: 500, pb: 2 }}
        >
          Sign in
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            name="username"
            label="Username"
            id="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={!!formik.touched.username && !!formik.errors.username}
            helperText={formik.touched.username && formik.errors.username}
          ></TextField>

          <TextField
            fullWidth
            margin="normal"
            type="password"
            label="Password"
            name="password"
            id="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={!!formik.touched.password && !!formik.errors.password}
            helperText={formik.touched.password && formik.errors.password}
          ></TextField>

          <Button
            variant="contained"
            disableElevation
            sx={{ mt: 1, mb: 2 }}
            type="submit"
          >
            Next
          </Button>
        </Box>
      </Box>
    </Container>
  );
  // return (
  //   <div>
  //     <h1>Login</h1>
  //     <form onSubmit={formik.handleSubmit}>
  //       <label htmlFor="">Username</label>

  //       <input
  //         type="text"
  //         name="username"
  //         id="username"
  //         value={formik.values.username}
  //         onChange={formik.handleChange}
  //       ></input>
  //
  //       <label htmlFor="">Password</label>
  //       <input
  //         type="password"
  //         name="password"
  //         id="password"
  //         value={formik.values.password}
  //         onChange={formik.handleChange}
  //       ></input>
  //
  //       <button type="submit">Submit</button>
  //     </form>
  //   </div>
  // );
};

export default Login;
