
    
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import './style.css';
    import { jalan } from './jalan.js'
   

document.addEventListener("DOMContentLoaded", function() {

    
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
    
    function buildMap(pusat,jalan) {
        
    // Reload map
    document.getElementById('container').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";
    
        // Basemap
        map = L.map('map').setView([pusat.lat, pusat.lng], 18);
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="#">GoogleMaps</a> contributors'
        }).addTo(map);
    
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
                    d > 10  ? '#BD0026' :
                    d > 8  ? '#E31A1C' :
                    d > 6  ? '#FC4E2A' :
                    d > 4   ? '#FD8D3C' :
                    d > 2   ? '#FEB24C' :
                    d > 1   ? '#FED976' :
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
        var legend = L.control({position: 'bottomright'});
    
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
        var info = L.control();
    
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
    
        info.update = function (props) {
            this._div.innerHTML = '<h4>Data Kriminalitas</h4>' +  (props ?
                '<b>' + props.var + ' </b><br />' + props.nama_jalan + ''
                : 'Kejahatan di Sekitar');
        };
    
        info.addTo(map);
        
    
    }
    


    const dropdown = document.getElementById("kategori")

    dropdown.addEventListener("change", ()=>{
        var id = document.getElementById("kategori").value;
    
        let docRef = db.collection("kriminalitas").doc(id.toString());
        
        docRef.get().then(doc => {
                        console.log(doc.data());
                        
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
            
                        buildMap(pusat,jalan)
        });      
    })

    buildMap(pusat,jalan)
});





