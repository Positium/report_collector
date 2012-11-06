package com.example.tests;

import java.util.ArrayList;

public class FeatureCollection {

	private String type;
	
	private ArrayList<Feature> features;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public ArrayList<Feature> getFeatures() {
		return features;
	}

	public void setFeatures(ArrayList<Feature> features) {
		this.features = features;
	}
}
