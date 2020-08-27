 var crypto = require('crypto');
 var querystring = require('querystring')

// Eg URL to be craeted
// https://accelitas.cloud.looker.com/login/embed/%2Fembed%2Flooks%2F1?nonce=%22W0dLUPdQbURYbf2G%22&time=1598037982&session_length=600&external_user_id=%22test-id-123%22&permissions=%5B%22access_data%22%2C%22see_looks%22%5D&models=%5B%22user%22%5D&group_ids=%5B%5D&external_group_id=%22%22&user_attributes=%7B%7D&access_filters=%7B%7D&first_name=%22Testy%22&last_name=%22McTestFace%22&force_logout_login=true&signature=R48uuG%2BdqKOraXELAa17RnUrldY%3D

// "https://accelitas.cloud.looker.com/embed/dashboards/3?nonce="bv8e6DZMOKm2CJ8r"&time=1598038129&session_length=900&external_user_id="57"&permissions=["see_user_dashboards","see_lookml_dashboards","access_data","see_looks"]&models=["thelook"]&access_filters={"fake_model":{"id":1}}&first_name="Embed Steve"&last_name="Krouse"&group_ids=[4]&external_group_id="awesome_engineers"&user_attributes={"an_attribute_name":"my_attribute_value","my_number_attribute":"42"}&force_logout_login=true&signature=MhK5SrxpdlEp/T+QQ3eR3iBrC8o=&embed_domain=http://localhost"

// Working
// https://accelitas.cloud.looker.com/login/embed/%2Fembed%2Fdashboards%2F7?nonce=%22tO36J7aTckjJX9QK%22&time=1598282889&session_length=600&external_user_id=%22test-id-123%22&permissions=%5B%22access_data%22%2C%22see_looks%22%2C%22see_user_dashboards%22%2C%22see_lookml_dashboards%22%2C%22explore%22%2C%22create_table_calculations%22%2C%22download_with_limit%22%2C%22download_without_limit%22%2C%22see_drill_overlay%22%2C%22save_content%22%2C%22embed_browse_spaces%22%2C%22schedule_look_emails%22%2C%22schedule_external_look_emails%22%2C%22send_to_sftp%22%2C%22send_to_s3%22%2C%22send_outgoing_webhook%22%2C%22see_sql%22%2C%22send_to_integration%22%2C%22create_alerts%22%5D&models=%5B%22accelitas_model%22%5D&group_ids=%5B%5D&external_group_id=%22%22&user_attributes=%7B%7D&access_filters=%7B%7D&first_name=%22Testy%22&last_name=%22McTestFace%22&force_logout_login=true&signature=rFzXt4RQ6qgeYunajPe1meUv0TA%3D

var config = {
	secret: "1ee8c60506843bac4a222dd362c354f4774045526b6feba37ee70158e4f9f136",
}

function nonce(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function forceUnicodeEncoding(string) {
    return decodeURIComponent(encodeURIComponent(string));
}

function created_signed_embed_url(options) {
    // looker options
    var secret = options.secret;
    var host = options.host;

    // user options
    var json_external_user_id = JSON.stringify(options.external_user_id);
    var json_first_name = JSON.stringify(options.first_name);
    var json_last_name = JSON.stringify(options.last_name);
    var json_permissions = JSON.stringify(options.permissions);
    var json_models = JSON.stringify(options.models);
    var json_group_ids = JSON.stringify(options.group_ids);
    var json_external_group_id = JSON.stringify(options.external_group_id || "");
    var json_user_attributes = JSON.stringify(options.user_attributes || {});
    var json_access_filters = JSON.stringify(options.access_filters || {});

    // url/session specific options
    var embed_path = '/login/embed/' + encodeURIComponent(options.embed_url);
    // var embed_path = '/embed/' + encodeURIComponent(options.embed_url);
    var json_session_length = JSON.stringify(options.session_length);
    var json_force_logout_login = JSON.stringify(options.force_logout_login);

    // Add
    // var json_embed_domain = JSON.stringify(options.embed_domain);
    // Add-

    // computed options
    var json_time = JSON.stringify(Math.floor((new Date()).getTime() / 1000));
    var json_nonce = JSON.stringify(nonce(16));

    // compute signature
    var string_to_sign = "";
    string_to_sign += host + "\n";
    string_to_sign += embed_path + "\n";
    // Add
    // string_to_sign += json_embed_domain + "\n";
    // Add-
    string_to_sign += json_nonce + "\n";
    string_to_sign += json_time + "\n";
    string_to_sign += json_session_length + "\n";
    string_to_sign += json_external_user_id + "\n";
    string_to_sign += json_permissions + "\n";
    string_to_sign += json_models + "\n";
    string_to_sign += json_group_ids + "\n";
    string_to_sign += json_external_group_id + "\n";
    string_to_sign += json_user_attributes + "\n";
    string_to_sign += json_access_filters;

    var signature = crypto.createHmac('sha1', secret).update(forceUnicodeEncoding(string_to_sign)).digest('base64').trim();

    // construct query string
    var query_params = {
	// Add
	// embed_domain: json_embed_domain,
	// embed_domain: "http://localhost:1337",
    // Add-

        nonce: json_nonce,
        time: json_time,
        session_length: json_session_length,
        external_user_id: json_external_user_id,
        permissions: json_permissions,
        models: json_models,
        access_filters: json_access_filters,
        first_name: json_first_name,
        last_name: json_last_name,
        group_ids: json_group_ids,
        external_group_id: json_external_group_id,
        user_attributes: json_user_attributes,
        force_logout_login: json_force_logout_login,
        signature: signature,

    };

    var query_string = querystring.stringify(query_params);

    return host + embed_path + '?' + query_string;
}

function sample() {
    var fifteen_minutes = 15 * 60;


    // CONFIG Object
    // Options Object
    var url_data = {
        host: 'accelitas.cloud.looker.com',
        // secret: '8ea3be011d0668741234216e06845692bab69e0101d00dcfe399dae03c52513c',
        secret: config.secret,
        // external_user_id: 'test-id-10',

        // group_ids: [5],
        // external_user_id: 'hd-1',
        // last_name: 'HomeDepot',
        // user_attributes: {'org': "Home Depot"},
        // permissions: ["access_data","see_looks","see_user_dashboards","see_lookml_dashboards", "download_with_limit","download_without_limit","see_drill_overlay","save_content"],
		//
		//
        // group_ids: [8], // Embed-Users-Group
        // group_ids: [6],
        // external_user_id: 'fs-1',
        // last_name: 'FusionSeven',
        // user_attributes: {'org': "FusionSeven"},
        // permissions: ["access_data","see_looks","see_user_dashboards","see_lookml_dashboards", "download_with_limit","download_without_limit","see_drill_overlay","save_content"],

        group_ids: [4],
        external_user_id: 'oa-1',
        first_name: 'Tester',
        last_name: 'OrgAdmin',
        user_attributes: {'org': "org_admin"},
        permissions: ["access_data","see_looks","see_user_dashboards","see_lookml_dashboards","explore","create_table_calculations","download_with_limit","download_without_limit","see_drill_overlay","save_content","embed_browse_spaces","schedule_look_emails","schedule_external_look_emails","send_to_sftp","send_to_s3","send_outgoing_webhook","see_sql","send_to_integration","create_alerts"],

        // group_ids: [5], // 5: HomeDepot
        external_group_id: 'awesome_engineers',
        // permissions: ['see_user_dashboards', 'see_lookml_dashboards', 'access_data', 'see_looks'],
        // permissions: ['access_data', 'download_without_limit', 'schedule_look_emails', 'see_drill_overlay', 'see_lookml_dashboards', 'see_looks', 'see_user_dashboards', 'send_to_integration'],
        // models: ['thelook'],
        // models: ['users'],
        // models: ['accelitas_model'],
        // models: ["accelitas_model", "input"],
		models: ["accelitas_model","aspen_looker_db","Monthly_Spend"],
        // access_filters: {
        //     fake_model: {
        //         id: 1
        //     }
        // },
        access_filters: {},
        // user_attributes: {"an_attribute_name": "my_attribute_value", "my_number_attribute": "42"},
        session_length: fifteen_minutes,
        // embed_url: "/embed/dashboards/7",
        // embed_url: "/embed/dashboards/7?embed_domain=http://localhost:1337",
        // embed_url: "/embed/dashboards/9?embed_domain=http://localhost:1337",
		//
        embed_url: "/embed/dashboards/15?embed_domain=http://localhost:1337",
        // embed_url: "/embed/dashboards/15?embed_domain=localhost:1337",
        // embed_url: "/embed/dashboards/15?embed_domain=http://local.accelitas.looker.com:1337/",
        // embed_url: "/embed/dashboards/15",
        force_logout_login: true,

	// Add
	// embed_domain: 'http://localhost:1337',
	// embed_domain: "http://localhost",
	// Add-
    };

    var url = created_signed_embed_url(url_data);
    return "https://" + url;
}

function createHtmlBody(src) {
    var html = "<!DOCTYPE html><html><body>";
    var html = "<a href='" + src + "'>" + src + "</a> <br> <br> <br>";
    // let testUrl = 'https://accelitas.cloud.looker.com/login/embed/%2Fembed%2Flooks%2F1?nonce=%22W0dLUPdQbURYbf2G%22&time=1598037982&session_length=600&external_user_id=%22test-id-1234%22&permissions=%5B%22access_data%22%2C%22see_looks%22%5D&models=%5B%22user%22%5D&group_ids=%5B%5D&external_group_id=%22%22&user_attributes=%7B%7D&access_filters=%7B%7D&first_name=%22Testy%22&last_name=%22McTestFace%22&force_logout_login=true&signature=R48uuG%2BdqKOraXELAa17RnUrldY%3D';
	// html += "<iframe src='"+testUrl+"' height='700' width='1200'></iframe>";
	html += "<iframe src='"+src+"' height='700' width='1200'></iframe>";
	html += "</body></html>";
	return html;
}



var http = require('http');

http.createServer(function (req, res) {

	var url = sample();
	console.log('Created url: ' + url + "\n\n");

  res.writeHead(200, {'Content-Type': 'text/html'});

  // res.end("<a href='" + url + "'>" + url + "</a>");
  res.end( createHtmlBody(url) );

}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
