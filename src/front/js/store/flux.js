import swal from "sweetalert2";
const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      accessToken: "null",
      userInfo: {},
      message: null,
      pets: [],
      singlePet: [],
      signup: [],
      signupKeeper: [],
      getKeepers: [],
      currentUser: [],
      profilePic: null,
      bookings: [],
      ownerPets: [],
      dates: null //Si se cambia este null ir tambien a keeperForm en setRange y cambiar el argumento de setDates
    },
    actions: {
      setDates: (obj) => {
        const { dates } = getStore()
        setStore({ dates: obj })
      },
      getPets: async () => {
        const { pets } = getStore();
        try {
          fetch(process.env.BACKEND_URL + "/api/pets")
            .then((resp) => {
              if (!resp.ok) {
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              setStore({ pets: data });
            });
        } catch (error) {
          console.error(error);
        }
      },
      //Get pets by owner id
      getOwnerPets: async (owner_id) => {
        const { pets } = getStore();
        try {
          fetch(process.env.BACKEND_URL + `/api/pets/owner/${owner_id}`)
            .then((resp) => {
              if (!resp.ok) {
                if (resp.status == 404) {
                  throw Error({ "msg": "User does not exist" });
                }
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              setStore({ pets: data });
              if (owner_id === getStore().userInfo.userId) {
                setStore({ ownerPets: data })
                localStorage.setItem("ownerPets", JSON.stringify(data))
              }
              return "ok";
            });
        } catch (error) {
          console.error(error);
        }
      },
      createPet: async (obj) => {
        try {
          const response = await fetch(process.env.BACKEND_URL + `/api/pets`, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
              "Content-Type": "application/json",
            },
          })
          if (!response.ok) {
            console.error(response.status + ": " + response.statusText)
          }
          let data = await response.json()
          getActions().getOwnerPets(obj.owner_id);
          return data
        } catch (error) {
          console.error(error);
        }
      },
      updatePet: async (obj) => {
        try {
          fetch(process.env.BACKEND_URL + `/api/pets/${obj.id}`, {
            method: "PUT",
            body: JSON.stringify(obj),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw Error(response.status + ": " + response.statusText);
              }
              return response.json();
            })
            .then((data) => {
              const { pets } = getStore()
              let arr = pets
              for (let pet in arr) {
                if (arr[pet].id == obj.id) {
                  arr[pet] = obj
                }
              }
              setStore({ pets: arr })
              if (parseInt(obj.owner_id) === getStore().userInfo.userId) {
                setStore({ ownerPets: arr })
                localStorage.setItem("ownerPets", JSON.stringify(arr))
              }
            });
        } catch (error) {
          console.error(error);
        }
      },
      getPet: async (id) => {
        const { singlePet } = getStore();
        try {
          fetch(process.env.BACKEND_URL + `/api/pets/${id}`)
            .then((resp) => {
              if (!resp.ok) {
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              setStore({ singlePet: data });
            });
        } catch (error) {
          console.error(error);
        }
      },
      deletePet: async (obj) => {
        try {
          fetch(process.env.BACKEND_URL + `/api/pets/${obj.id}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                if (response.status == 404) {
                  throw Error("No pet associated with ID provided");
                } else {
                  throw Error(response.status + ": " + response.statusText);
                }
              }
              return response.json();
            })
            .then((data) => {
              getActions().getOwnerPets(obj.owner_id);
            });
        } catch (error) {
          console.error({ error });
          return;
        }
      },

      apiFetch: async (endpoint, method = "GET", body = null) => {
        var request;
        if (method == "GET") {
          request = await fetch(process.env.BACKEND_URL + "/api" + endpoint);
        } else {
          const params = {
            method,
            headers: {
              "Content-Type": "application/json",
            },
          };
          if (body) params.body = JSON.stringify(body);
          request = fetch(process.env.BACKEND_URL + "/api" + endpoint, params);
        }
        const resp = await request;
        const data = await resp.json();
        return { code: resp.status, data };
      },

      apiFetchProtected: async (endpoint, method = "GET", body = null) => {
        const { accessToken } = getStore();
        if (!accessToken || accessToken === "null") {
          localStorage.setItem("userInfo", {});
          return "No token"; //error 422
        }
        const params = {
          method,
          headers: {
            /* prettier-ignore */
            'Authorization': "Bearer " + accessToken,
          },
        };
        if (body) {
          params.headers["Content-Type"] = "application/json";
          params.body = JSON.stringify(body);
        }
        const resp = await fetch(
          process.env.BACKEND_URL + "/api" + endpoint,
          params
        );
        const data = await resp.json();
        return { code: resp.status, data };
      },

      loadTokens: () => {
        let token = localStorage.getItem("accessToken");
        let userData = {}
        let pets = []
        if (localStorage.hasOwnProperty("userInfo") != null) {
          userData = JSON.parse(localStorage.getItem("userInfo"))
        }
        if (localStorage.hasOwnProperty("ownerPets") != null) {
          pets = JSON.parse(localStorage.getItem("ownerPets"))
        }
        if (token) {
          setStore({ accessToken: token });
          setStore({ userInfo: userData })
          setStore({ ownerPets: pets })
        }
      },

      login: async (email, password) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/login", "POST", {
          email,
          password,
        });
        const { message, token, user_id, user_type, pets } = resp.data;
        localStorage.setItem("accessToken", token);
        if (token != "null") {
          setStore({ accessToken: token });
          let userData = { "userId": user_id, "user_type": user_type }
          setStore({ ownerPets: pets })
          setStore({ userInfo: userData })
          localStorage.setItem("ownerPets", JSON.stringify(pets))
          localStorage.setItem("userInfo", JSON.stringify(userData))
        }
        return resp.code;
      },

      logout: () => {
        setStore({ accessToken: "null" });
        setStore({ userInfo: {} })
        localStorage.removeItem("userInfo");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("keeper");
        localStorage.removeItem("ownerPets")
        localStorage.removeItem("__paypal_storage__");
      },

      getUserInfo: async () => {
        const { apiFetchProtected } = getActions();
        const resp = await apiFetchProtected("/helloprotected");
        setStore({ userInfo: resp.data });
        return "Ok";
      },
      signup: async (first_name, last_name, email, location, password) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/signup", "POST", {
          first_name,
          last_name,
          email,
          location,
          password,
        });
        if (resp.code === 201) {
          return resp;
        }
        navigate("/login");
      },

      signupKeeper: async (
        first_name,
        last_name,
        email,
        location,
        phone_number,
        password
      ) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/signup/keeper", "POST", {
          first_name,
          last_name,
          email,
          location,
          phone_number,
          password,
        });
        if (resp.code === 201) {
          return resp;
        }
        navigate("/login");
      },
      getKeeper: async (id) => {
        const { apiFetch } = getActions()
        const response = await apiFetch(`/keeper/${id}`, "GET");
        setStore({ currentUser: response.data })
        return response.data
      },
      updateKeeper: async (obj) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch(`/keeper/${obj.id}`, "PUT", {
          first_name: obj.first_name,
          last_name: obj.last_name,
          hourly_pay: obj.hourly_pay,
          description: obj.description,
          experience: obj.experience,
          services: obj.services,
          location: obj.location,
          phone_number: obj.phone_number,
        });
        if (resp.code != 200) {
          console.error("Error saving profile, code: " + resp.code);
          return resp;
        }
        const { currentUser } = getStore()
        let user = resp.data
        Object.assign(resp.data, { "profile_pic": currentUser.profile_pic })
        setStore({ currentUser: user })
      },
      uploadPicture: async (formData, id) => {
        const { accessToken } = getStore();
        if (!accessToken) {
          return "No token";
        }
        const resp = await fetch(process.env.BACKEND_URL + `/api/avatar/${id}`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": "Bearer " + accessToken
          }
        });
        if (!resp.ok) {
          console.error("Error saving picture, code: " + resp.code);
          return resp;
        }
        const { currentUser } = getStore()
        let data = await resp.json()
        let user = currentUser
        user["profile_pic"] = data.public_url
        setStore({ currentUser: user })
        return user
      },
      uploadpetAvatar: async (formData, id) => {
        const { accessToken } = getStore();
        if (!accessToken) {
          return "No token";
        }
        const resp = await fetch(process.env.BACKEND_URL + `/api/pet_avatar/${id}`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": "Bearer " + accessToken
          }
        });
        if (!resp.ok) {
          console.error("Error saving picture, code: " + resp.code);
          return resp;
        }
        let data = await resp.json()
        return data
      },

      getKeepers: async () => {
        try {
          const store = getStore();
          const { apiFetch } = getActions();

          const resp = await apiFetch("/keeper", "GET");

          if (resp.code === 200) {
            setStore({ getKeepers: resp.data });
          } else {
            console.error("Error al obtener los keepers:", resp);
          }
        } catch (error) {
          console.error("Error en getKeepers:", error);
        }
      },

      getOwner: async (id) => {
        try {
          fetch(process.env.BACKEND_URL + `/api/owner/${id}`).then(resp => {
            if (!resp.ok) {
              console.error(resp.status + ": " + resp.statusText)
            }
            return resp.json();
          }).then(data => {
            setStore({ currentUser: data })
            setStore({ pets: data.pets })
            if (getStore().userInfo.userId == data.id) {
              setStore({ ownerPets: data.pets })
              localStorage.setItem("ownerPets", JSON.stringify(data.pets))
            }
            return data;
          })
        } catch (error) {
          console.error(error);
        }
      },
      updateOwner: async (obj) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch(`/owner/${obj.id}`, "PUT", {
          "first_name": obj.first_name,
          "last_name": obj.last_name,
          "description": obj.description,
          "location": obj.location
        });
        if (resp.code != 200) {
          console.error("Error saving profile, code: " + resp.code);
          return resp;
        }
        setStore({ currentUser: resp.data })
      },
      getdailySlots: async (id, date) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch(`/bookings/${id}/?start_date=${date}`, "GET")
        if (resp.code != 200) {
          console.error(resp.status + ": " + resp.statusText)
        }
        return resp.data
      },
      getrangeSlots: async (id, start_date, end_date) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch(`/bookings/maxDate/${id}/?start_date=${start_date}&end_date=${end_date}`, "GET")
        if (resp.code != 200) {
          console.error(resp.status + ": " + resp.statusText)
        }
        return resp.data
      },
      requestPasswordRecovery: async (email) => {
        const response = await getActions().apiFetch(`/recoverypassword`, "POST", { email })


        return response
      },
      changePasswordWithToken: async (tokenPassword, password) => {
        let resp = await fetch(process.env.BACKEND_URL + `/api/changepassword`, {
          method: "POST",
          body: JSON.stringify({ password }),
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer  ${tokenPassword}`
          },
        }
        )
        return resp
      },

      createPayment: async (details) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/order", "POST", {
          paypal_id: details.id,
          create_time: details.create_time,
          payer_email: details.payer.email_address,
          payer_name: details.payer.name.given_name + " " + details.payer.name.surname,
          payer_id: details.payer.payer_id,
          amount_currency: details.purchase_units[0].amount.currency_code,
          amount_value: details.purchase_units[0].amount.value,
          description: details.purchase_units[0].description,
          payee_email: details.purchase_units[0].payee.email_address,
          status: details.status
        });
        if (resp.code === 200) {
          return resp;
        } else {
          console.error("Error en el pago:", resp);
        }
      },
      getBookings: async (type, id) => {
        const { apiFetchProtected } = getActions();
        const response = await apiFetchProtected(`/bookings/${type}/${id}`, "GET")
        if (response.code != 200) {
          console.error(response.status + ": " + response.statusText)
        }
        setStore({ bookings: response.data })
        return response;
      },
      createBooking: async (bookingData) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/booking", "POST", {
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          start_hour: bookingData.start_hour,
          end_hour: bookingData.end_hour,
          status: bookingData.status,
          keeper_id: bookingData.keeper_id,
          owner_id: bookingData.owner_id,
          pets: bookingData.pets,
          cost: bookingData.cost,
          service: bookingData.service
        });
        if (resp.code === 201) {
          return resp;
        } else {
          console.error("Error en el booking:", resp);
        }
      },

    }
  };
};

export default getState;