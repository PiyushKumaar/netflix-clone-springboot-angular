export const VIDEO_CATEGORIES = [
    'Action',
    'Drama',
    'Comedy',
    'Sci-Fi',
    'Thriller',
    'Documentary',
    'Horror',
    'Romance',
    'Adventure',
    'Fantasy',
    'Animation',
    'Crime',
    'Mystery',
    'Biography',
    'History',
    'War',
    'Western',
    'Musical',
    'Sport',
    'Family'
];

export const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

export const DIALOG_CONFIG = {
    VIDEO_PLAYER:{
        width:'100vw',
        height:'100vh',
        maxWidth:'100vw',
        maxHeight:'100vh',
        panelClass:'video-player-dialog',
        hasBackdrop:true,
        disableclass:false
    },
    CHANGE_PASSWORD:{
        width:'600px',
        maxWidth:'90vw',
        panelClass:'video-player-dialog',
        hasBackdrop:true,
        disableclass:false
    },
    CONFIRM:{
        width:'500px',
        panelClass:'custom-dialog-container',
        hasBackdrop:true,
        disableclass:false
    },
    MANAGER_USER:{
        width:'600px',
        maxWidth:'90vw',
        panelClass:'user-dialog',
        hasBackdrop:true,
        disableclass:false
    },
    VIDEO_FROM:{
        width:'95vw',
        maxWidth:'1400px',
        height:'auto',
        maxHeight:'95vh',
        panelClass:'video-from-dialog',
        hasBackdrop:true,
        disableclass:false

    }
}