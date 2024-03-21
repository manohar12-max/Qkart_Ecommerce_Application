import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardActionArea, 
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  
  return (
    <Card className="card">
      <CardMedia
          component="img"
          image={product.image}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${product.cost}
          </Typography>
          <Rating 
          name="half-rating-read" 
          value={product.rating}
          precision={0.5} 
          readOnly />
        </CardContent>
     
      <CardActions className="card-actions">
        <Button 
          fullWidth
          className="card-button"
          variant="contained"
          startIcon={<AddShoppingCartOutlined />}
          onClick={handleAddToCart}>
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );

};

export default ProductCard;
