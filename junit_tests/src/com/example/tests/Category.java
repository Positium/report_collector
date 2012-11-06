package com.example.tests;

import java.util.ArrayList;


public class Category {
	private String id;
	private String name;
	private String color;
	private ArrayList<SubCategory> subcategories;

	public Category() {
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public ArrayList<SubCategory> getSubcategorys() {
		return subcategories;
	}

	public void setSubcategorys(ArrayList<SubCategory> subcategorys) {
		this.subcategories = subcategorys;
	}
}