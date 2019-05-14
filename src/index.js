

import L from 'leaflet';
import './style.scss';
import { jalan } from './jalan.js'
import {Spinner} from 'spin.js';



document.addEventListener("DOMContentLoaded", function () {



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
        lines: 13, // The number of lines to draw
        length: 38, // The length of each line
        width: 17, // The line thickness
        radius: 45, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#ffffff', // CSS color or array of colors
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


    let map;
    let dropdownValue = -1;

    function buildMap(pusat, jalan) {

        // Reload map
        document.getElementById('container').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";

        // Basemap
        map = L.map('map').setView([pusat.lat, pusat.lng], 18);
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="#">GoogleMaps</a> contributors',
            zoomControl: true
        }).addTo(map);
        map.zoomControl.setPosition('bottomright');

        // Ambil data jalan


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
        var legend = L.control({ position: 'bottomleft' });

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

        // Info datanya
        var info = L.control({ position: 'topright' });

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = '<h4>Data Kriminalitas</h4>' + (props ?
                '<b>' + props.var + ' </b><br />' + props.nama_jalan + ''
                : 'Sekitar Polstat STIS');
        };

        info.addTo(map);


        var dropdown = L.control({ position: 'topright' });
        dropdown.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<select id="kategori"><option value="-1">Pilih Kategori</option><option value="0">Semua</option><option value="1">Pencurian</option><option value="2">Penipuan</option><option value="3">Pemalakan</option><option value="4">Kekerasan</option><option value="5">Asusila</option></select>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };

        dropdown.addTo(map);

        const dropdownButton = document.getElementById("kategori")

        // set nilai dropdown sesuai dengan niali terakhir yang dipilih
        dropdownButton.value = dropdownValue;
        dropdownButton.addEventListener("change", () => {
            var id = document.getElementById("kategori").value;

            // ubah nilai dropdown di variabel global
            dropdownValue = id;

            if (id == -1) {
                return
            }

            let docRef = db.collection("kriminalitas").doc(id.toString());
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
            }).finally(()=>{
                spinner.stop()

            });

        })


    }

    buildMap(pusat, jalan)




    // taruh kode di atas
});



