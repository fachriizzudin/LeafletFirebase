

import L from 'leaflet';
import './style.scss';
import { jalan } from './jalan.js'
import { Spinner } from 'spin.js/spin';
// import './L.Control.Sidebar'
import './leaflet-sidebar'
// import '@fortawesome/fontawesome-free'


window.addEventListener('DOMContentLoaded', (event) => {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyBmo1IBULQht8jVo3gTDaZv0YnSWo4JVSY",
        authDomain: "sig-kriminalitas.firebaseapp.com",
        databaseURL: "https://sig-kriminalitas.firebaseio.com",
        projectId: "sig-kriminalitas",
        storageBucket: "sig-kriminalitas.appspot.com",
        messagingSenderId: "1002325018706",
        appId: "1:1002325018706:web:94814bce23554a9e"
    };
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();

    var opts = {
        lines: 11, // The number of lines to draw
        length: 15, // The length of each line
        width: 7, // The line thickness
        radius: 20, // The radius of the inner circle
        scale: 0.55, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000000', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        position: 'absolute' // Element positioning
    };

    var target = document.getElementById('foo');

    // Icon
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    })

    // Titik Pusat Peta
    const pusat = {
        "lat": -6.231528,
        "lng": 106.867471
    }



    let dropdownValue = -1;

    function buildMap(pusat, jalan) {

        // Reload map
        document.getElementById('container').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";

        // Basemap
    
        var map = L.map('map', {
            minZoom: 0,
            maxZoom: 18
        }).setView([pusat.lat, pusat.lng], 17);
        
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="#">GoogleMaps</a> contributors',
        }).addTo(map);

        map.removeControl(map.zoomControl);


        var sidebar = L.control.sidebar({
            autopan: false,       // whether to maintain the centered map point when opening the sidebar
            closeButton: true,    // whether t add a close button to the panes
            container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
            position: 'left',     // left or right
        }).addTo(map);

        // add panels dynamically to the sidebar

        sidebar.addPanel({
            id: 'Home',
            tab: '<i class="fa fa-info"></i>',
            title: '<p style="font-family:Raleway, sans-serif;">SIG Kriminalitas Sekitar Polstat STIS</p>',
            pane: '<p style = "font-family:Raleway, sans-serif;">Sistem ini menggunakan teknologi leaflet.js untuk menampilkan peta dengan segala atributnya dan menggunakan google firestore sebagai cloud storage</p> <br> <p style = "font-family:Raleway, sans-serif">Data yang ditampilkan banyaknya kejadian per Jalan selama 3 tahun terakhir. Kejadian tidak hanya terjadi tepat di Jalan, namun bisa rumah tinggal atau tempat yang alamatnya berada di jalan tersebut</p>',
        });

        sidebar.addPanel({
            id: 'Profile',
            tab: '<i class="fa fa-user"></i>',
            title: '<p style="font-family:Raleway, sans-serif;">Developers</p>',
            pane: '<p style = "font-family:Raleway, sans-serif;">Adalard Yusuf Kamarastha (16.8963) <br> Fachri Izzudin Lazuardi (16.9109) <br> Luqman Ismail Abdurrahim (16.9241) <br> Rahmat Ramadhan (16.9370) <br> Rozan Fikri (16.9404)</p>',
        });

        sidebar.addPanel({
            id: 'ghlink',
            tab: '<i class="fa fa-github"></i>',
            title: '<p style="font-family:Raleway, sans-serif;">Project Source</p>',
            pane: '<p style = "font-family:Raleway, sans-serif;"><a href="https://github.com/fachriizzudin/LeafletFirebase" target="_blank"> - See this project on github!</a> <br> <a href="https://git.stis.ac.id/FacHr1/sig-uas" target="_blank"> - See also (deprecated) previous project</a> </p>',
        });

        // Vektor Jalan 
        var geojson = L.geoJSON(jalan, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);


        // Tematiknya
        function style(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.var)
            };
        }

        function getColor(d) {
            return d > 12 ? '#800026' :
                d > 10 ? '#BD0026' :
                    d > 8 ? '#E31A1C' :
                        d > 6 ? '#FC4E2A' :
                            d > 4 ? '#FD8D3C' :
                                d > 2 ? '#FEB24C' :
                                    d > 1 ? '#FED976' :
                                        '#FFEDA0';
        }


        // Agar vektor map interaktif
        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }



        // Legenda
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 4, 6, 8, 10, 12],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);


        // zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);


        // Info datanya
        var info = L.control({ position: 'topright' });

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = '<h4 style = "font-family:Raleway,sans-serif">Data Banyaknya Kejadian Kriminalitas</h4>' + (props ?
                '<b>' + props.var + ' </b><br />' + props.nama_jalan + ''
                : '<p style = "font-family:Raleway,sans-serif">Sekitar Polstat STIS</p>');
        };

        info.addTo(map);


        var dropdown = L.control({ position: 'topright' });
        dropdown.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<select id="kategori" style = "font-family:Raleway, sans-serif"><option value="-1" style = "font-family:Raleway, sans-serif">Pilih Kategori</option><option value="0" style = "font-family:Raleway, sans-serif">Semua</option><option value="1" style = "font-family:Raleway, sans-serif">Pencurian</option><option value="2" style = "font-family:Raleway, sans-serif">Penipuan</option><option value="3" style = "font-family:Raleway, sans-serif">Pemalakan</option><option value="4" style = "font-family:Raleway, sans-serif">Kekerasan</option><option value="5" style = "font-family:Raleway, sans-serif">Asusila</option></select>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };

        dropdown.addTo(map);

        var dropdownButton = document.getElementById("kategori")

        // set nilai dropdown sesuai dengan niali terakhir yang dipilih
        dropdownButton.value = dropdownValue;
        dropdownButton.addEventListener("change", () => {
            var id = document.getElementById("kategori").value;

            // ubah nilai dropdown di variabel global
            dropdownValue = id;

            if (id == -1) {
                return
            }

            var docRef = db.collection("kriminalitas").doc(id.toString());


            var spinner = new Spinner(opts).spin(target);



            docRef.get().then(doc => {
                document.getElementById('container').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";


                jalan.features[0].properties.var = doc.data().saabun
                jalan.features[1].properties.var = doc.data().asem
                jalan.features[2].properties.var = doc.data().mangga
                jalan.features[3].properties.var = doc.data().kbsayur
                jalan.features[4].properties.var = doc.data().sensus
                jalan.features[5].properties.var = doc.data().otista3
                jalan.features[6].properties.var = doc.data().otista2
                jalan.features[7].properties.var = doc.data().bonasut2
                jalan.features[8].properties.var = doc.data().hhasbi
                jalan.features[9].properties.var = 0 // gang masjid tidak ada di firestore karena datanya 0
                jalan.features[10].properties.var = doc.data().sholihun
                jalan.features[11].properties.var = doc.data().ayub
                jalan.features[12].properties.var = doc.data().otistaraya
                jalan.features[13].properties.var = doc.data().bonasel1
                jalan.features[14].properties.var = doc.data().bonasel2
                jalan.features[15].properties.var = doc.data().hyahya
                jalan.features[16].properties.var = doc.data().penghulu
                buildMap(pusat, jalan)
            }).finally(() => {
                spinner.stop()

            });

        })


        // buildMap
    }

    buildMap(pusat, jalan)



    // taruh kode di atas
});

