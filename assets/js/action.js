var usefacInfo = [];

// import * as XLSX from 'xlsx';
document.addEventListener("DOMContentLoaded", () => {
		
	var StandardTab = document.getElementById('StandardTab');
	var SaaSTab = document.getElementById('SaaSTab');
	var EtcTab = document.getElementById('EtcTab');

	var MenuButton = document.getElementById('btnMenu');
	var Menu = document.getElementById('MENU');
	var AddFav = document.getElementById('addfav');

	var searchText = document.getElementById('searchText');

	StandardTab.addEventListener('click', (e) => {
		StandardTab.parentNode.classList.add('current');
		SaaSTab.parentNode.classList.remove('current');
		EtcTab.parentNode.classList.remove('current');

		document.getElementById('SaaSSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'none';
		document.getElementById('StandardSection').style.display = 'block';
	});

	SaaSTab.addEventListener('click', (e) => {
		SaaSTab.parentNode.classList.add('current');
		StandardTab.parentNode.classList.remove('current');
		EtcTab.parentNode.classList.remove('current');

		document.getElementById('SaaSSection').style.display = 'block';
		document.getElementById('StandardSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'none';
	});

	EtcTab.addEventListener('click', (e) => {
		EtcTab.parentNode.classList.add('current');
		SaaSTab.parentNode.classList.remove('current');
		StandardTab.parentNode.classList.remove('current');

		document.getElementById('StandardSection').style.display = 'none';
		document.getElementById('SaaSSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'block';
	});

	// AddFav.addEventListener('click', (e) => {
	// 	addFavorite();
	// 	alert("즐겨찾기 추가")
	// });

	searchText.addEventListener('keyup', (e) => {
		var searchValue = searchText.value;

		var arrIdx = usefacInfo.findIndex(function(el) { return el.NAME.indexOf(searchValue) > -1 });
		var gubun = usefacInfo[arrIdx].GUBUN;
		var name = usefacInfo[arrIdx].NAME;
		var db = usefacInfo[arrIdx].DB;
		var was = usefacInfo[arrIdx].WAS;
		var url = usefacInfo[arrIdx].URL;
		var server1 = usefacInfo[arrIdx].SERVER1;
		var server2 = usefacInfo[arrIdx].SERVER2;
		var univCd = usefacInfo[arrIdx].UNIV_CD;

		if((e.code == "Enter" || e.code == "NumpadEnter")) {
			window.open(url);
		}

		var infoUl = $("#infoUl");
		infoUl.find("li").remove();

		if(!!! searchValue || searchValue == "") return;

		var liStr = "";
		liStr += "<li class=\"info\">GUBUN : " + gubun+"</li>";
		liStr += "<li class=\"info\">NAME : " + name+"</li>";
		if(gubun != "Standard") {
			liStr += "<li class=\"info\">DB : " + db+"</li>";
			liStr += "<li class=\"info\">WAS : " + was+"</li>";
			liStr += "<li class=\"info\">SERVER1 : " + server1+"</li>";
			liStr += "<li class=\"info\">SERVER2 : " + server2+"</li>";
		} else {
			liStr += "<li class=\"info\">UNIV_CD : " + univCd+"</li>";
		}
		infoUl.append(liStr);

	});

	//엑셀에서 기관리스트 읽어오기
	(async () => {
		let response = await fetch("/univTest.xlsx");
		// let t_xml = await response.text(); // 텍스트 형태로 가져오고

		const buffer = await response.arrayBuffer();
		// var reader = new FileReader();
		const univList= XLSX.read(buffer, {type: 'array'});

		const parsingExcel = parseXLSX(univList);
	})();

});

const parseXLSX = (univList) => {
	univList.SheetNames.forEach(function(sheetName,idx){
		var sheet = univList.Sheets[univList.SheetNames[idx]];
		const rows = XLSX.utils.sheet_to_json(sheet);

		var rowsArea = $("#"+sheetName+"Section").find(".rows");

		var divStr = "<div class=\"row col-4-wide\"><ul class=\""+sheetName+"\">";
		var liStrObj = ["liStr1", "liStr2", "liStr3", "liStr4", "liStr5"];
		liStrObj["liStr1"] = divStr;
		liStrObj["liStr2"] = divStr;
		liStrObj["liStr3"] = divStr;
		liStrObj["liStr4"] = divStr;
		liStrObj["liStr5"] = divStr;

		rows.forEach((row,idx) => {
			const name		= row['기관명'];
			const db		= row['DB'];
			const was		= row['WAS'];
			const url		= row['URL'] + "rsysmng_login.act";
			const server1	= row['SERVER1'];
			const server2	= row['SERVER2'];
			const univCd	= row['UNIV_CD'];
			const gubun		= row['구분'];

			var liStr = "<li class=\"icon fa-folder\"><a href=\"" + url + "\" target=\"_blank\">" + name +"</a></li>";

			if(sheetName == "Standard") {
				liStr = "<li class=\"icon fa-folder\"><a href=\"" + url + "\" target=\"_blank\">("+univCd+ ")" + name +"</a></li>";
				var grp = Math.floor((idx)/20)+1;
				liStrObj["liStr"+grp] += liStr;
			}else if(sheetName == "SaaS") {
				switch(server1) {
					case 1 : liStrObj["liStr1"] += liStr; break;
					case 3 : liStrObj["liStr2"] += liStr; break;
					case 5 : liStrObj["liStr3"] += liStr; break;
					case 7 : liStrObj["liStr5"] += liStr; break;
					case 9 : liStrObj["liStr4"] += liStr; break;
				}
			}

			usefacInfo.push({
				GUBUN:gubun
				,NAME:name
				,DB:db
				,WAS:was
				,URL:url
				,SERVER1:server1
				,SERVER2:server2
				,UNIV_CD:univCd
			});

			// if(!! name && name.indexOf(searchValue) > -1) console.log("찾음");
		});

		var endDiv = "</ul></div>";

		rowsArea.append(liStrObj["liStr1"] + endDiv + liStrObj["liStr2"] + endDiv + liStrObj["liStr3"] + endDiv + liStrObj["liStr4"] + endDiv + liStrObj["liStr5"] + endDiv);
	})

};

// function addFavorite() {
// 	var title = "";
// 	var url = "";
// 	confirm("진짜?");
// 	$(".premiums li a").each(function (index, element){
// 		title = $(this).text();
// 		url = $(this).attr('href');
// 		window.external.addFavorite(url, title);
// 	})
//
// }
function searchTarget(searchValue) {
	var allList = document.getElementsByTagName("a");
	var count = 0;
	var href = "";

	for(var i = 0; i < allList.length; i++){
		if(allList[i].innerHTML.indexOf(searchValue)>-1){
			count++;
			href = allList[i].href;
		}
	}
	if (count == 1) {
		window.open(href);
	} else if (count > 1){
		alert("검색된 기관 " + count + "개");
	}
}


