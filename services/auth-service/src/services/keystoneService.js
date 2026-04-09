const axios = require('axios');
const config = require('../config');

const keystoneService = {
  async getAdminToken() {
    try {
      const res = await axios.post(`${config.openstack.authUrl}/auth/tokens`, {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: {
                name:     config.openstack.username,
                password: config.openstack.password,
                domain: { name: config.openstack.domainName },
              },
            },
          },
          scope: {
            project: {
              name:   config.openstack.projectName,
              domain: { name: config.openstack.domainName },
            },
          },
        },
      }, { timeout: 5000 });
      return res.headers['x-subject-token'];
    } catch (err) {
      console.warn('Keystone unavailable, using local auth only:', err.message);
      return null;
    }
  },

  async authenticateUser(username, password, projectName) {
    try {
      const res = await axios.post(`${config.openstack.authUrl}/auth/tokens`, {
        auth: {
          identity: {
            methods: ['password'],
            password: {
              user: { name: username, password, domain: { name: config.openstack.domainName } },
            },
          },
          scope: {
            project: { name: projectName || config.openstack.projectName, domain: { name: config.openstack.domainName } },
          },
        },
      }, { timeout: 5000 });
      return {
        token:   res.headers['x-subject-token'],
        project: res.data.token.project,
        user:    res.data.token.user,
      };
    } catch {
      return null;
    }
  },
};

module.exports = keystoneService;
