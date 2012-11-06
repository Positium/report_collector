package com.example.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import java.util.Scanner;

import org.apache.commons.codec.binary.Base64;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.thoughtworks.selenium.DefaultSelenium;

public class ReportCollectorTests {
	DefaultSelenium selenium;
	Random random = new Random();
	String SEND_URL = "http://gistudeng.gg.bg.ut.ee/jenkins-test/index.php/receiver";
	
	@Before	
	public void setUp() throws Exception {
		selenium = new DefaultSelenium("localhost", 4444, "*firefox", "http://gistudeng.gg.bg.ut.ee");
		selenium.start();
	}
	
	@Test
	public void testReportDelivery() throws Exception {		
		String urlParameters = (String) generateReport()[5];	
		postReport(SEND_URL,urlParameters);		
	}
	@Test
	public void testloginAndlogout() throws Exception {		
		logIn();
		logOut();
	}
	@Test
	public void testCategorys() throws Exception {
		logIn();
		JsonArray jArray = getCategorys();
		selenium.open("/jenkins-test/index.php/home");
		Thread.sleep(2000);	
		selenium.waitForPageToLoad("30000");
		selenium.click("id=catView");

		
		Thread.sleep(1000);
		Gson gson = new Gson();
		for (JsonElement obj : jArray) {
			Category data = gson.fromJson(obj, Category.class);
	        assertTrue(selenium.isTextPresent(data.getName()));
	        selenium.click("id="+(Integer.parseInt(data.getId())*100));
	        Thread.sleep(500);
			for  (SubCategory subcat : data.getSubcategorys()) {
				assertTrue(selenium.isTextPresent(subcat.getName()));
			}
		}
	}
	@Test
	public void testNewReportView() throws Exception {
		
		Object[] parameters = generateReport();
		String urlParameters = (String) parameters[5];		
		int newReportID = postReport(SEND_URL,urlParameters);	
		
		logIn();
		Thread.sleep(4000);
		String newReportPostition = selenium.getEval("var returnvalue = \"errorfind\"; " +
				"for (var i=0;i<window.pointsArray.length;i++) {" +
					"if (window.pointsArray[i].attributes['ID']=="+newReportID+") {" +
						"returnvalue=i;" +
						"break;" +
					"}" +
				"}" +
				"returnvalue;");
		assertFalse(newReportPostition.equals("errorfind"));
		selenium.runScript("window.listView.onFeatureSelect(window.pointsArray["+newReportPostition+"])");
		Thread.sleep(4000);
		String htmlSource = selenium.getHtmlSource();
		String picDecoded = URLDecoder.decode((String)parameters[1],"UTF-8");
		assertTrue(htmlSource.contains(picDecoded));
		SimpleDateFormat dt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		assertTrue(htmlSource.contains((String)dt.format(new Date(Long.parseLong((String)parameters[2])*1000))));
		assertTrue(htmlSource.contains(Integer.toString((Integer)((Object[])parameters[0])[2])+"m"));
		assertTrue(htmlSource.contains((String)parameters[3]));
	}
	@Test
	public void testgetNewReportFromDB() throws Exception {
		Object[] parameters = generateReport();
		String urlParameters = (String) parameters[5];	
		int newReportID = postReport(SEND_URL,urlParameters);	
		
		logIn();
		Thread.sleep(2000);
		JsonObject jobject = getReports();
		JsonArray jarray = jobject.getAsJsonArray("features");
		Gson gson = new Gson();
		SimpleDateFormat dt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		for (JsonElement obj : jarray) {
			Feature feature = gson.fromJson(obj, Feature.class);
			if (Integer.parseInt(feature.getProperties().getID())==newReportID) {
				assertEquals(feature.getProperties().getTIMESTAMP(),(String)dt.format(new Date(Long.parseLong((String)parameters[2])*1000)));
				assertEquals(feature.getProperties().getCOMMENTARY(),(String)parameters[3]);
				assertEquals(new Integer(Integer.parseInt(feature.getProperties().getID_CATEGORY())),((Integer[])parameters[4])[0]);
				assertEquals(new Integer(Integer.parseInt(feature.getProperties().getID_SUBCATEGORY())),((Integer[])parameters[4])[1]);
				assertEquals(feature.getProperties().getGPS_ACCURACY(),Integer.toString((Integer)((Object[])parameters[0])[2])+"m");
				return;
			}
		}
		assertEquals((2+2),6);
	}
	
	public JsonObject getReports() throws Exception {
		selenium.open("/jenkins-test/index.php/transmit/");
		Thread.sleep(2000);
		String htmlPageBody = selenium.getBodyText();
		JsonParser parser = new JsonParser();			
		JsonObject Jobject = parser.parse(htmlPageBody).getAsJsonObject();
		
		return Jobject;
	
	}
	
	public JsonArray getCategorys() throws Exception {
		selenium.open("/jenkins-test/index.php/getcategories/getsubcat");
		
		Thread.sleep(2000);
		String htmlPageBody = selenium.getBodyText();
		JsonParser parser = new JsonParser();
		JsonArray Jarray = parser.parse(htmlPageBody).getAsJsonArray();		
		return Jarray;		
	}
	
	
	public void logIn() throws Exception {
		selenium.open("/jenkins-test/index.php");
		Thread.sleep(2000);
	
		selenium.waitForPageToLoad("30000");
		selenium.type("id=username", "admin");
		selenium.type("id=password", "Tartuzeppelin_151");
		selenium.click("name=submit");
		selenium.waitForPageToLoad("30000");
		Thread.sleep(2000);
	}
	
	public void logOut() throws Exception {
		selenium.click("link=Logi välja");
		selenium.waitForPageToLoad("30000");
		Thread.sleep(1000);
	}
	
	public Object[] generateReport() throws IOException {

		String urlParameters;
		Object[] geoLocation = generateRandomGeoLocation();
		String imageString = URLEncoder.encode(getImageString("res/NatureMountains.jpg"),"UTF-8");
		String currentTime = Long.toString((long)(new Date().getTime()/1000));
		String uuid = "fd1e1dceb0801ba4";
		String comment = "SeleniumTest";
		Integer[] categorys = generateCategoryIDs();		
		urlParameters = "submit=report&uuid="+uuid+"&geolocation%5Blatitude%5D="+geoLocation[0].toString()+
				"&geolocation%5Blongitude%5D="+geoLocation[1].toString()+"&geolocation%5Baccuracy%5D="+geoLocation[2].toString()+
				"&photo=data%3Aimage%2Fjpeg%3Bbase64%2C"+imageString+"&category="+Integer.toString(categorys[0])+"&subcategory="+Integer.toString(categorys[1])+
				"&comment="+comment+"&timestamp="+currentTime;
		Object[] report = new Object[]{geoLocation, imageString,currentTime, comment, categorys, urlParameters};
		return report;
	}
	public Integer[] generateCategoryIDs() {
		Integer category = random.nextInt(6)+1;
		Integer subcategory=0;
		switch (category) {
			case 1: 
				subcategory = random.nextInt(2 - 1 + 1) + 1;
				break;
			case 2:
				subcategory = random.nextInt(6 - 3 + 1) + 3;
				break;
			case 3:
				subcategory = random.nextInt(10 - 7 + 1) + 7;
				break;
			case 4:
				subcategory = random.nextInt(13 - 11 + 1) + 11;
				break;
			case 5:
				subcategory = random.nextInt(19 - 14 + 1) + 14;
				break;
			case 6:
				subcategory = 0;
				break;
		}
		Integer[] categorys = {category, subcategory};
		return categorys;
	}
	
	public Object[] generateRandomGeoLocation() {
		Object[] geoLocation = new Object[3];	
		geoLocation[0] = new Double(58.34+(58.38-58.34)*random.nextDouble());
		geoLocation[1] = new Double(26.67+(26.75-26.67)*random.nextDouble());
		geoLocation[2] = new Integer(random.nextInt(1200));		
		return geoLocation;
	}
	
	public String getImageString(String picfilename) throws IOException  {
		
		File pictureFile = new File(picfilename);
		FileInputStream imageInFile = new FileInputStream(pictureFile);
		byte imageData[] = new byte[(int) pictureFile.length()];
		imageInFile.read(imageData);
		String imageString = Base64.encodeBase64String(imageData);
		return imageString;
	}
	
	public int postReport(String request, String urlParameters) throws Exception {
		URL url = new URL(request);
		int responseCode;
		String response = "";
		HttpURLConnection connection = (HttpURLConnection) url.openConnection();
		int reportID = 0;
		
		connection.setDoOutput(true);
		connection.setDoInput(true);
		
		connection.setInstanceFollowRedirects(false); 
		
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded"); 
		connection.setRequestProperty("charset", "utf-8");
		connection.setRequestProperty("Content-Length", "" + Integer.toString(urlParameters.getBytes().length));
		connection.setUseCaches (false);		
		
		OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream ());
		writer.write(urlParameters);
		writer.flush();
		writer.close();
		
		responseCode = connection.getResponseCode();
		if (responseCode!=200) {
			throw new IllegalArgumentException("Got invalide responseCode "+responseCode);
		}
		
		Scanner inStream = new Scanner(connection.getInputStream());
		while (inStream.hasNextLine()) {
			response+= (inStream.nextLine());
		}
		if (!response.contains("success")) {
			throw new IllegalArgumentException("Got invalide response "+response);
		}
		String[] parsedString = response.split(":");
		try {
			System.out.println(parsedString[2]);
			reportID = Integer.parseInt(parsedString[2].replaceAll("[}\"]+", ""));
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("Got invalide reportID "+reportID);
		}
		connection.disconnect();
		return reportID;	
	}
	
	@After
	public void tearDown() throws Exception {
		selenium.stop();
	}
}
